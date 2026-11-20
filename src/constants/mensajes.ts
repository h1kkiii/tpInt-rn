// Todos los textos que ve la persona ante un error o un estado vacío.
// Nunca se muestra el mensaje técnico de un error.
export const MENSAJES = {
  cargandoCatalogo: 'Cargando el catálogo…',
  errorCatalogo: 'No pudimos conectarnos con la biblioteca. Revisá tu conexión y probá de nuevo.',
  catalogoVacio: 'Todavía no hay libros en el catálogo.',
  recientesVacio: 'Todavía no abriste ningún libro. Los últimos que mires van a aparecer acá.',
  cargandoLibro: 'Buscando el libro…',
  tituloIsbnInvalido: 'Ese ISBN no es válido',
  isbnInvalido: (isbn: string) =>
    isbn === ''
      ? 'Falta el ISBN del libro. Tiene que tener 13 números.'
      : `"${isbn}" no es un ISBN: tiene que tener 13 números, sin letras.`,
  tituloLibroInexistente: 'No tenemos ese libro',
  libroInexistente: (isbn: string) => `No encontramos ningún libro con el ISBN ${isbn} en el catálogo de la biblioteca.`,
  busquedaVacia: 'Escribí un título o un autor',
  buscando: 'Buscando…',
  errorBusqueda: 'No pudimos buscar en este momento. Probá de nuevo.',
  sinResultados: (consulta: string) => `No encontramos libros para "${consulta}"`,
} as const;
