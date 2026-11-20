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

// Cuánto queda en pantalla el aviso de "ISBN desconocido" del escáner.
export const DURACION_AVISO_ESCANER_MS = 4000;

// Modo demostración: el recordatorio llega a los 15 s en lugar de un día
// antes del vencimiento (para poder probarlo en clase).
export const MODO_DEMOSTRACION = true;
export const SEGUNDOS_DEMOSTRACION = 15;

// Debounce del guardado en AsyncStorage.
export const DEMORA_GUARDADO_MS = 400;
