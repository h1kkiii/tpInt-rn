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

export type EsperaPropia = {
  isbn: string;
  titulo: string;
  posicion: number;
};

export type ItemReservas =
  | { tipo: 'aviso'; aviso: Aviso }
  | { tipo: 'prestamo'; isbn: string; prestamo: Prestamo }
  | { tipo: 'espera'; isbn: string; espera: EsperaPropia };

export type SeccionReservas = {
  clave: 'avisos' | 'prestamos' | 'esperas';
  titulo: string;
  vacio: string | null;
  data: ItemReservas[];
};

export type FilaMostrador = {
  isbn: string;
  titulo: string;
  frente: string;
  cantidad: number;
};
