import { colaDesde } from '../copiaAlEscribir';
import { filasMostrador } from '../mostrador';
import type { Libro } from '@/types';

const libros: Libro[] = [
  { isbn: '9789500401036', titulo: 'Sobre héroes y tumbas', autor: 'Ernesto Sabato', anio: 2006, ejemplares: 0 },
  { isbn: '9789500712347', titulo: 'Pedro Páramo', autor: 'Juan Rulfo', anio: 2005, ejemplares: 0 },
  { isbn: '9788499089508', titulo: 'Ficciones', autor: 'Jorge Luis Borges', anio: 2011, ejemplares: 2 },
];

describe('filasMostrador', () => {
  it('lista solo los libros con espera, con quién está al frente y cuántos esperan', () => {
    const esperas = {
      '9789500401036': colaDesde(['Lucía', 'Tomás']),
      '9789500712347': colaDesde(['Pedro']),
    };
    expect(filasMostrador(libros, esperas)).toEqual([
      { isbn: '9789500401036', titulo: 'Sobre héroes y tumbas', frente: 'Lucía', cantidad: 2 },
      { isbn: '9789500712347', titulo: 'Pedro Páramo', frente: 'Pedro', cantidad: 1 },
    ]);
  });

  it('una cola vaciada hace desaparecer la fila', () => {
    const cola = colaDesde(['Pedro']);
    cola.desencolar();
    expect(filasMostrador(libros, { '9789500712347': cola })).toEqual([]);
  });
});
