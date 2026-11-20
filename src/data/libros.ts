import type { Libro } from '../types';

// "Ficciones" y "Rayuela" llevan el ISBN real de la edición impresa,
// para probar el escáner con el código de barras de la contratapa.
export const LIBROS: Libro[] = [
  { isbn: '9788499089508', titulo: 'Ficciones', autor: 'Jorge Luis Borges', anio: 2011, ejemplares: 2 },
  { isbn: '9788420437484', titulo: 'Rayuela', autor: 'Julio Cortázar', anio: 2019, ejemplares: 3 },
  { isbn: '9789500401036', titulo: 'Sobre héroes y tumbas', autor: 'Ernesto Sabato', anio: 2006, ejemplares: 0 },
  { isbn: '9789875660014', titulo: 'El Aleph', autor: 'Jorge Luis Borges', anio: 2011, ejemplares: 2 },
  { isbn: '9789500712347', titulo: 'Pedro Páramo', autor: 'Juan Rulfo', anio: 2005, ejemplares: 0 },
  { isbn: '9789871384020', titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', anio: 2007, ejemplares: 3 },
  { isbn: '9789507314520', titulo: 'El túnel', autor: 'Ernesto Sabato', anio: 2011, ejemplares: 1 },
  { isbn: '9789875803176', titulo: 'Martín Fierro', autor: 'José Hernández', anio: 2015, ejemplares: 4 },
  { isbn: '9789506442873', titulo: 'Facundo', autor: 'Domingo F. Sarmiento', anio: 2003, ejemplares: 1 },
  { isbn: '9789871173013', titulo: 'Don Segundo Sombra', autor: 'Ricardo Güiraldes', anio: 2004, ejemplares: 0 },
  { isbn: '9789500442138', titulo: 'La invención de Morel', autor: 'Adolfo Bioy Casares', anio: 2012, ejemplares: 2 },
  { isbn: '9789877381542', titulo: 'Los siete locos', autor: 'Roberto Arlt', anio: 2014, ejemplares: 1 },
  { isbn: '9789500708883', titulo: 'Bestiario', autor: 'Julio Cortázar', anio: 2016, ejemplares: 2 },
  { isbn: '9789871001279', titulo: 'La ciudad y los perros', autor: 'Mario Vargas Llosa', anio: 2012, ejemplares: 1 },
  { isbn: '9789504903253', titulo: 'Boquitas pintadas', autor: 'Manuel Puig', anio: 2010, ejemplares: 1 },
  { isbn: '9789875667891', titulo: 'La casa de los espíritus', autor: 'Isabel Allende', anio: 2013, ejemplares: 2 },
  { isbn: '9789507321146', titulo: 'Las venas abiertas de América Latina', autor: 'Eduardo Galeano', anio: 2010, ejemplares: 0 },
];

// Personas que ya estaban esperando cuando arranca la app (isbn → nombres, del frente al final).
export const ESPERAS_INICIALES: Record<string, string[]> = {
  '9789500401036': ['Lucía', 'Tomás'],
  '9789500712347': ['Pedro'],
};
