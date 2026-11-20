// La app tiene una sola persona usuaria: así figura en las listas de espera.
export const USUARIO = 'Yo';

// Credenciales fijas del personal (la consigna pide usuario y clave en el código).
export const CREDENCIALES = {
  usuario: 'biblioteca',
  clave: 'ipf2026',
} as const;

export const DIAS_PRESTAMO = 7;

export const CANTIDAD_RECIENTES = 3;

// Debounce del buscador: espera este tiempo sin teclas antes de pedir.
export const DEMORA_BUSQUEDA_MS = 300;
