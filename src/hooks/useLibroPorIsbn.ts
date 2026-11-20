import { useLibros } from '@/hooks/useLibros';
import { esIsbnValido, primerValor, type ParametroRuta } from '@/lib/parametros';
import type { Libro } from '@/types';

export type EstadoLibroPorIsbn =
  | { estado: 'invalido'; isbn: string }
  | { estado: 'cargando'; isbn: string }
  | { estado: 'error'; isbn: string; reintentar: () => void }
  | { estado: 'inexistente'; isbn: string }
  | { estado: 'encontrado'; isbn: string; libro: Libro };

// Lo usan el detalle y la confirmación de reserva: el parámetro de la URL no
// es confiable (deep links, ISBN escritos a mano), así que se valida acá.
export function useLibroPorIsbn(parametro: ParametroRuta): EstadoLibroPorIsbn {
  const { libros, cargando, error, reintentar } = useLibros();
  const isbn = primerValor(parametro);

  if (!esIsbnValido(isbn)) return { estado: 'invalido', isbn };
  if (cargando) return { estado: 'cargando', isbn };
  if (error) return { estado: 'error', isbn, reintentar };

  const libro = libros.find((candidato) => candidato.isbn === isbn);
  if (!libro) return { estado: 'inexistente', isbn };
  return { estado: 'encontrado', isbn, libro };
}
