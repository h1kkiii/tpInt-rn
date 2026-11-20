import { useMemo } from 'react';

import { USUARIO } from '@/constants/biblioteca';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import { armarSecciones, esperasDe } from '@/lib/reservas';
import type { SeccionReservas } from '@/types/biblioteca';

export function useMisReservas(): SeccionReservas[] {
  const { avisos, prestamos, esperas, titulos } = useBiblioteca();
  return useMemo(
    () => armarSecciones(avisos, prestamos, esperasDe(USUARIO, esperas, titulos)),
    [avisos, prestamos, esperas, titulos],
  );
}
