import type { Cola } from '@/estructuras/Cola';
import type { Pila } from '@/estructuras/Pila';

export type Prestamo = {
  isbn: string;
  titulo: string;
  vence: string; // fecha de devolución en ISO 8601
  recordatorio: boolean;
  notificacionId: string | null;
};

export type LibroReciente = {
  isbn: string;
  titulo: string;
  autor: string;
};

export type Aviso = {
  id: string;
  texto: string;
};

export type EstadoBiblioteca = {
  prestamos: Prestamo[];
  esperas: Record<string, Cola<string>>;
  recientes: Pila<LibroReciente>;
  titulos: Record<string, string>;
  avisos: Aviso[];
};

export type ResultadoReserva =
  | { tipo: 'prestamo'; vence: string }
  | { tipo: 'espera'; posicion: number }
  | { tipo: 'repetido'; motivo: 'prestamo' | 'espera' };

export type ResultadoEntrega =
  | { tipo: 'entregado'; persona: string; esUsuario: boolean; titulo: string }
  | { tipo: 'sin-espera' };
