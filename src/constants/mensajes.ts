// Todos los textos que ve la persona ante un error o un estado vacío.
// Nunca se muestra el mensaje técnico de un error.
export const MENSAJES = {
  cargandoCatalogo: 'Cargando el catálogo…',
  errorCatalogo: 'No pudimos conectarnos con la biblioteca. Revisá tu conexión y probá de nuevo.',
  catalogoVacio: 'Todavía no hay libros en el catálogo.',
  recientesVacio: 'Todavía no abriste ningún libro. Los últimos que mires van a aparecer acá.',
} as const;
