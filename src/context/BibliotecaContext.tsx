import { createContext, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';

import { CANTIDAD_RECIENTES, CREDENCIALES, DIAS_PRESTAMO, USUARIO } from '@/constants/biblioteca';
import { Cola } from '@/estructuras/Cola';
import { crearEstadoInicial, preverReserva } from '@/lib/biblioteca';
import { cambiarCola, cambiarPila } from '@/lib/copiaAlEscribir';
import { sumarDias } from '@/lib/fechas';
import type { Libro } from '@/types';
import type {
  Aviso,
  EstadoBiblioteca,
  LibroReciente,
  Prestamo,
  ResultadoEntrega,
  ResultadoReserva,
} from '@/types/biblioteca';

export type ValorBiblioteca = {
  prestamos: Prestamo[];
  esperas: EstadoBiblioteca['esperas'];
  recientes: LibroReciente[];
  titulos: Record<string, string>;
  avisos: Aviso[];
  sesion: boolean;
  reservar: (libro: Libro) => ResultadoReserva;
  devolver: (isbn: string) => Prestamo | null;
  definirRecordatorio: (isbn: string, notificacionId: string | null) => boolean;
  agregarReciente: (libro: LibroReciente) => void;
  entregarAlSiguiente: (isbn: string) => ResultadoEntrega;
  agregarAviso: (texto: string) => void;
  descartarAviso: (id: string) => void;
  iniciarSesion: (usuario: string, clave: string) => boolean;
  cerrarSesion: () => void;
};

export const BibliotecaContext = createContext<ValorBiblioteca | null>(null);

type Props = {
  children: ReactNode;
};

export function BibliotecaProvider({ children }: Props) {
  const [estado, setEstado] = useState<EstadoBiblioteca>(crearEstadoInicial);
  const [sesion, setSesion] = useState(false);

  // Espejo síncrono del estado: cada acción lee la versión más nueva aunque se
  // llame dos veces antes del próximo render (por ejemplo, un doble toque en
  // "Confirmar") y puede devolver su resultado en el momento.
  const estadoRef = useRef(estado);
  const contadorAvisos = useRef(0);

  const aplicar = useCallback((nuevo: EstadoBiblioteca) => {
    estadoRef.current = nuevo;
    setEstado(nuevo);
  }, []);

  const reservar = useCallback(
    (libro: Libro): ResultadoReserva => {
      const actual = estadoRef.current;
      const resultado = preverReserva(libro, actual.prestamos, actual.esperas[libro.isbn], USUARIO, new Date());
      if (resultado.tipo === 'prestamo') {
        const prestamo: Prestamo = {
          isbn: libro.isbn,
          titulo: libro.titulo,
          vence: resultado.vence,
          recordatorio: false,
          notificacionId: null,
        };
        aplicar({ ...actual, prestamos: [...actual.prestamos, prestamo] });
      }
      if (resultado.tipo === 'espera') {
        const cola = actual.esperas[libro.isbn] ?? new Cola<string>();
        aplicar({
          ...actual,
          esperas: { ...actual.esperas, [libro.isbn]: cambiarCola(cola, (copia) => copia.encolar(USUARIO)) },
          titulos: { ...actual.titulos, [libro.isbn]: libro.titulo },
        });
      }
      return resultado;
    },
    [aplicar],
  );

  // Devuelve el préstamo quitado para que quien llama cancele su notificación.
  const devolver = useCallback(
    (isbn: string): Prestamo | null => {
      const actual = estadoRef.current;
      const prestamo = actual.prestamos.find((p) => p.isbn === isbn);
      if (!prestamo) return null;
      aplicar({ ...actual, prestamos: actual.prestamos.filter((p) => p.isbn !== isbn) });
      return prestamo;
    },
    [aplicar],
  );

  // Escribe el flag y el id juntos; false si el préstamo ya no existe.
  const definirRecordatorio = useCallback(
    (isbn: string, notificacionId: string | null): boolean => {
      const actual = estadoRef.current;
      if (!actual.prestamos.some((p) => p.isbn === isbn)) return false;
      aplicar({
        ...actual,
        prestamos: actual.prestamos.map((p) =>
          p.isbn === isbn ? { ...p, recordatorio: notificacionId !== null, notificacionId } : p,
        ),
      });
      return true;
    },
    [aplicar],
  );

  const agregarReciente = useCallback(
    (libro: LibroReciente) => {
      const actual = estadoRef.current;
      if (actual.recientes.tope()?.isbn === libro.isbn) return;
      aplicar({ ...actual, recientes: cambiarPila(actual.recientes, (copia) => copia.push(libro)) });
    },
    [aplicar],
  );

  const entregarAlSiguiente = useCallback(
    (isbn: string): ResultadoEntrega => {
      const actual = estadoRef.current;
      const cola = actual.esperas[isbn];
      const persona = cola?.frente();
      if (!cola || persona === undefined) return { tipo: 'sin-espera' };

      const restante = cambiarCola(cola, (copia) => {
        copia.desencolar();
      });
      const esperas = { ...actual.esperas };
      if (restante.vacia) delete esperas[isbn];
      else esperas[isbn] = restante;

      const esUsuario = persona === USUARIO;
      const titulo = actual.titulos[isbn] ?? '';
      const prestamos = esUsuario
        ? [
            ...actual.prestamos,
            {
              isbn,
              titulo,
              vence: sumarDias(new Date(), DIAS_PRESTAMO).toISOString(),
              recordatorio: false,
              notificacionId: null,
            },
          ]
        : actual.prestamos;

      aplicar({ ...actual, esperas, prestamos });
      return { tipo: 'entregado', persona, esUsuario, titulo };
    },
    [aplicar],
  );

  const agregarAviso = useCallback(
    (texto: string) => {
      const actual = estadoRef.current;
      contadorAvisos.current += 1;
      const aviso: Aviso = { id: `${Date.now()}-${contadorAvisos.current}`, texto };
      aplicar({ ...actual, avisos: [aviso, ...actual.avisos] });
    },
    [aplicar],
  );

  const descartarAviso = useCallback(
    (id: string) => {
      const actual = estadoRef.current;
      aplicar({ ...actual, avisos: actual.avisos.filter((aviso) => aviso.id !== id) });
    },
    [aplicar],
  );

  const iniciarSesion = useCallback((usuario: string, clave: string): boolean => {
    const valida = usuario.trim() === CREDENCIALES.usuario && clave === CREDENCIALES.clave;
    if (valida) setSesion(true);
    return valida;
  }, []);

  const cerrarSesion = useCallback(() => setSesion(false), []);

  // Del más reciente al más antiguo: el tope de la Pila va primero.
  const recientes = useMemo(
    () => estado.recientes.aArray().reverse().slice(0, CANTIDAD_RECIENTES),
    [estado.recientes],
  );

  const valor = useMemo<ValorBiblioteca>(
    () => ({
      prestamos: estado.prestamos,
      esperas: estado.esperas,
      recientes,
      titulos: estado.titulos,
      avisos: estado.avisos,
      sesion,
      reservar,
      devolver,
      definirRecordatorio,
      agregarReciente,
      entregarAlSiguiente,
      agregarAviso,
      descartarAviso,
      iniciarSesion,
      cerrarSesion,
    }),
    [
      estado.prestamos,
      estado.esperas,
      estado.titulos,
      estado.avisos,
      recientes,
      sesion,
      reservar,
      devolver,
      definirRecordatorio,
      agregarReciente,
      entregarAlSiguiente,
      agregarAviso,
      descartarAviso,
      iniciarSesion,
      cerrarSesion,
    ],
  );

  return <BibliotecaContext.Provider value={valor}>{children}</BibliotecaContext.Provider>;
}
