import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';

import type { Esquema, Paleta } from '@/constants/tema';

// Headers, fondos de pantalla, modales y la barra de tabs toman estos colores.
export function crearTemaNavegacion(esquema: Esquema, paleta: Paleta): Theme {
  const base = esquema === 'oscura' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: paleta.primario,
      background: paleta.fondo,
      card: paleta.superficie,
      text: paleta.texto,
      border: paleta.borde,
      notification: paleta.peligro,
    },
  };
}
