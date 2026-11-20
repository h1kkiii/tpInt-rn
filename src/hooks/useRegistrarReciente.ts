import { useEffect } from 'react';

import { useBiblioteca } from '@/hooks/useBiblioteca';
import type { Libro } from '@/types';

// Apila el libro en "Vistos recientemente" una sola vez por libro abierto:
// las dependencias son datos primitivos, no el objeto (cada respuesta de la
// API trae objetos nuevos y re-apilaría en cada carga).
export function useRegistrarReciente(libro: Libro | null) {
  const { agregarReciente } = useBiblioteca();
  const isbn = libro?.isbn;
  const titulo = libro?.titulo;
  const autor = libro?.autor;

  useEffect(() => {
    if (isbn === undefined || titulo === undefined || autor === undefined) return;
    agregarReciente({ isbn, titulo, autor });
  }, [agregarReciente, isbn, titulo, autor]);
}
