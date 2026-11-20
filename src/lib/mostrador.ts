import type { Cola } from '@/estructuras/Cola';
import type { Libro } from '@/types';
import type { FilaMostrador } from '@/types/biblioteca';

// Libros del catálogo que tienen gente esperando, en el orden del catálogo.
// Con la cola vacía, el libro no aparece.
export function filasMostrador(libros: readonly Libro[], esperas: Record<string, Cola<string>>): FilaMostrador[] {
  const filas: FilaMostrador[] = [];
  for (const libro of libros) {
    const cola = esperas[libro.isbn];
    const frente = cola?.frente();
    if (cola && frente !== undefined) {
      filas.push({ isbn: libro.isbn, titulo: libro.titulo, frente, cantidad: cola.tamanio });
    }
  }
  return filas;
}
