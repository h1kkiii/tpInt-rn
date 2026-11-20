import { DIAS_PRESTAMO } from '@/constants/biblioteca';
import { ESPERAS_INICIALES } from '@/data/libros';
import type { Cola } from '@/estructuras/Cola';
import { colaDesde, pilaDesde } from '@/lib/copiaAlEscribir';
import { sumarDias } from '@/lib/fechas';
import type { Libro } from '@/types';
import type { EstadoBiblioteca, LibroReciente, Prestamo, ResultadoReserva } from '@/types/biblioteca';

export function crearEstadoInicial(): EstadoBiblioteca {
  const esperas: Record<string, Cola<string>> = {};
  for (const [isbn, personas] of Object.entries(ESPERAS_INICIALES)) {
    esperas[isbn] = colaDesde(personas);
  }
  return {
    prestamos: [],
    esperas,
    recientes: pilaDesde<LibroReciente>([]),
    titulos: {},
    avisos: [],
  };
}

// Los disponibles se calculan siempre: nunca se guardan (E4d).
export function calcularDisponibles(libro: Libro, prestamos: readonly Prestamo[]): number {
  const prestados = prestamos.filter((prestamo) => prestamo.isbn === libro.isbn).length;
  return Math.max(0, libro.ejemplares - prestados);
}

export function personasEnEspera(cola: Cola<string> | undefined): number {
  return cola?.tamanio ?? 0;
}

// Posición contando desde 1 (el frente es la persona N° 1); null si no está.
export function posicionEnEspera(cola: Cola<string> | undefined, persona: string): number | null {
  if (!cola) return null;
  const indice = cola.aArray().indexOf(persona);
  return indice === -1 ? null : indice + 1;
}

// ÚNICA regla de reserva: la usa la pantalla para anticipar el resultado y el
// Context para aplicarlo, así nunca pueden contradecirse.
export function preverReserva(
  libro: Libro,
  prestamos: readonly Prestamo[],
  cola: Cola<string> | undefined,
  persona: string,
  ahora: Date,
): ResultadoReserva {
  if (prestamos.some((prestamo) => prestamo.isbn === libro.isbn)) {
    return { tipo: 'repetido', motivo: 'prestamo' };
  }
  if (posicionEnEspera(cola, persona) !== null) {
    return { tipo: 'repetido', motivo: 'espera' };
  }
  // Si ya hay gente esperando, se respeta la fila aunque haya un ejemplar libre.
  const hayFila = personasEnEspera(cola) > 0;
  if (!hayFila && calcularDisponibles(libro, prestamos) > 0) {
    return { tipo: 'prestamo', vence: sumarDias(ahora, DIAS_PRESTAMO).toISOString() };
  }
  return { tipo: 'espera', posicion: personasEnEspera(cola) + 1 };
}
