import { useMemo } from 'react';

import type { Paleta } from '@/constants/tema';
import { useTema } from '@/hooks/useTema';

// Cada archivo declara crearEstilos(paleta) a nivel de módulo; acá se memoriza
// por paleta para no recrear la hoja de estilos en cada render.
export function useEstilos<T>(crearEstilos: (paleta: Paleta) => T): T {
  const paleta = useTema();
  return useMemo(() => crearEstilos(paleta), [crearEstilos, paleta]);
}
