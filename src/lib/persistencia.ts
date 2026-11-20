import { colaDesde, pilaDesde } from '@/lib/copiaAlEscribir';
import type { Aviso, EstadoBiblioteca, LibroReciente, Prestamo } from '@/types/biblioteca';

export const VERSION_GUARDADO = 1;

// Forma en disco: las Colas y la Pila viajan como arreglos (aArray), porque
// JSON no conserva clases ni campos privados.
type EstadoGuardado = {
  version: typeof VERSION_GUARDADO;
  prestamos: Prestamo[];
  esperas: Record<string, string[]>;
  recientes: LibroReciente[];
  titulos: Record<string, string>;
  avisos: Aviso[];
};

export function serializar(estado: EstadoBiblioteca): string {
  const esperas: Record<string, string[]> = {};
  for (const [isbn, cola] of Object.entries(estado.esperas)) esperas[isbn] = cola.aArray();
  const guardado: EstadoGuardado = {
    version: VERSION_GUARDADO,
    prestamos: estado.prestamos,
    esperas,
    recientes: estado.recientes.aArray(),
    titulos: estado.titulos,
    avisos: estado.avisos,
  };
  return JSON.stringify(guardado);
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function esTexto(valor: unknown): valor is string {
  return typeof valor === 'string';
}

function esPrestamo(valor: unknown): valor is Prestamo {
  return (
    esObjeto(valor) &&
    esTexto(valor.isbn) &&
    esTexto(valor.titulo) &&
    esTexto(valor.vence) &&
    !Number.isNaN(Date.parse(valor.vence)) &&
    typeof valor.recordatorio === 'boolean' &&
    (valor.notificacionId === null || esTexto(valor.notificacionId))
  );
}

function esLibroReciente(valor: unknown): valor is LibroReciente {
  return esObjeto(valor) && esTexto(valor.isbn) && esTexto(valor.titulo) && esTexto(valor.autor);
}

function esAviso(valor: unknown): valor is Aviso {
  return esObjeto(valor) && esTexto(valor.id) && esTexto(valor.texto);
}

function esListaDe<T>(valor: unknown, esElemento: (x: unknown) => x is T): valor is T[] {
  return Array.isArray(valor) && valor.every(esElemento);
}

function esDiccionarioDe<T>(valor: unknown, esElemento: (x: unknown) => x is T): valor is Record<string, T> {
  return esObjeto(valor) && Object.values(valor).every(esElemento);
}

function esListaDeTextos(valor: unknown): valor is string[] {
  return esListaDe(valor, esTexto);
}

function esEstadoGuardado(valor: unknown): valor is EstadoGuardado {
  return (
    esObjeto(valor) &&
    valor.version === VERSION_GUARDADO &&
    esListaDe(valor.prestamos, esPrestamo) &&
    esDiccionarioDe(valor.esperas, esListaDeTextos) &&
    esListaDe(valor.recientes, esLibroReciente) &&
    esDiccionarioDe(valor.titulos, esTexto) &&
    esListaDe(valor.avisos, esAviso)
  );
}

// null si no hay nada guardado, si está corrupto o si es de otra versión:
// en esos casos la app arranca con el estado inicial.
export function deserializar(texto: string | null): EstadoBiblioteca | null {
  if (!texto) return null;
  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch {
    return null;
  }
  if (!esEstadoGuardado(datos)) return null;

  const esperas: EstadoBiblioteca['esperas'] = {};
  for (const [isbn, personas] of Object.entries(datos.esperas)) {
    if (personas.length > 0) esperas[isbn] = colaDesde(personas);
  }
  return {
    prestamos: datos.prestamos,
    esperas,
    recientes: pilaDesde(datos.recientes),
    titulos: datos.titulos,
    avisos: datos.avisos,
  };
}

// Si una notificación ya no está programada en el sistema (ya llegó, se
// reinstaló la app, se borraron los datos de Expo Go…), su id guardado no
// sirve: se limpia para que el interruptor muestre la verdad.
export function reconciliar(estado: EstadoBiblioteca, programadas: ReadonlySet<string>): EstadoBiblioteca {
  let cambio = false;
  const prestamos = estado.prestamos.map((prestamo) => {
    if (prestamo.notificacionId === null || programadas.has(prestamo.notificacionId)) return prestamo;
    cambio = true;
    return { ...prestamo, recordatorio: false, notificacionId: null };
  });
  return cambio ? { ...estado, prestamos } : estado;
}
