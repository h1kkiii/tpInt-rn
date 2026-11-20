import { useContext } from 'react';

import { BibliotecaContext, type ValorBiblioteca } from '@/context/BibliotecaContext';

export function useBiblioteca(): ValorBiblioteca {
  const valor = useContext(BibliotecaContext);
  if (!valor) {
    throw new Error('useBiblioteca() se usó fuera de <BibliotecaProvider>: envolvé la app con el provider en src/app/_layout.tsx.');
  }
  return valor;
}
