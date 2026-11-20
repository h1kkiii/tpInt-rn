import { Platform } from 'react-native';

export type Paleta = {
  fondo: string;
  superficie: string;
  superficieAlterna: string;
  borde: string;
  texto: string;
  textoSecundario: string;
  primario: string;
  sobrePrimario: string;
  peligro: string;
  sobrePeligro: string;
  exito: string;
  fondoAviso: string;
  textoAviso: string;
  fondoCamara: string;
  sobreCamara: string;
};

export type Esquema = 'clara' | 'oscura';

export const PALETAS: Record<Esquema, Paleta> = {
  clara: {
    fondo: '#F6F4EF',
    superficie: '#FFFFFF',
    superficieAlterna: '#ECE8DF',
    borde: '#C9C4B8',
    texto: '#1B1B1F',
    textoSecundario: '#55555F',
    primario: '#1F5FA8',
    sobrePrimario: '#FFFFFF',
    peligro: '#B3261E',
    sobrePeligro: '#FFFFFF',
    exito: '#1E6B37',
    fondoAviso: '#FFF1CC',
    textoAviso: '#4D3800',
    fondoCamara: '#000000',
    sobreCamara: '#FFFFFF',
  },
  oscura: {
    fondo: '#121316',
    superficie: '#1D1F24',
    superficieAlterna: '#2A2D33',
    borde: '#4A4E57',
    texto: '#ECECEF',
    textoSecundario: '#B4B6BE',
    primario: '#8AB4F8',
    sobrePrimario: '#0B1B33',
    peligro: '#F2B8B5',
    sobrePeligro: '#3B0907',
    exito: '#7FD49A',
    fondoAviso: '#3A3016',
    textoAviso: '#FFE08A',
    fondoCamara: '#000000',
    sobreCamara: '#FFFFFF',
  },
};

export const ESPACIO = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
} as const;

export const TAMANIO_TEXTO = {
  chico: 13,
  normal: 16,
  mediano: 18,
  grande: 22,
  titulo: 28,
} as const;

export const ALTO_LINEA = {
  chico: 18,
  normal: 22,
  mediano: 24,
  grande: 28,
  titulo: 34,
} as const;

export const RADIO = {
  chico: 6,
  normal: 12,
  pildora: 999,
} as const;

export const TAMANIO_ICONO = {
  chico: 18,
  normal: 24,
  grande: 48,
} as const;

// Área táctil mínima (pautas de accesibilidad de Android e iOS).
export const MINIMO_TACTIL = 44;

export const BORDE = {
  fino: 1,
  grueso: 2,
} as const;

export const FUENTE_MONO = Platform.select({ ios: 'Menlo', default: 'monospace' });

export const ANCHO_TARJETA_RECIENTE = 150;

export const OPACIDAD = {
  presionado: 0.8,
  inactivo: 0.5,
} as const;

export const ALTO_VISOR_CAMARA = 320;
