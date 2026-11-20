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
  reservaRepetida: 'Esta reserva ya estaba hecha: no se anotó dos veces.',
  sinPrestamos: 'No tenés libros prestados. Cuando reserves uno con ejemplares, aparece acá con su fecha de devolución.',
  sinEsperas: 'No estás en ninguna lista de espera.',
  sinNotificaciones: 'Sin notificaciones no podemos recordártelo, pero la fecha de devolución queda siempre acá.',
  recordatorioNoProgramado: 'No pudimos programar el recordatorio. La fecha de devolución queda siempre acá.',
  sinEspera: 'Ya no queda nadie esperando ese libro.',
  entregado: (titulo: string, persona: string) => `Se entregó "${titulo}" a ${persona}.`,
  yaPodesRetirar: (titulo: string) => `Ya podés retirar "${titulo}" en el mostrador.`,
  mostradorVacio: 'No hay libros con lista de espera. Cuando alguien se anote, aparece acá.',
  cargandoMostrador: 'Cargando las listas de espera…',
  loginIncompleto: 'Completá el usuario y la clave.',
  loginIncorrecto: 'El usuario o la clave no son correctos. Revisalos y probá de nuevo.',
  revisandoCamara: 'Revisando el permiso de la cámara…',
  cargandoCatalogoEscaner: 'Cargando el catálogo para reconocer los libros…',
  isbnEscaneadoDesconocido: (isbn: string) =>
    `El código ${isbn} no es de ningún libro de la biblioteca. Probá con otro libro o escribí el ISBN abajo.`,
  isbnManualVacio: 'Escribí el ISBN: son 13 números que están en la contratapa.',
  isbnManualConLetras: 'El ISBN lleva solo números (los guiones y espacios no importan).',
  isbnManualLargo: (cantidad: number) => `El ISBN tiene 13 números y escribiste ${cantidad}.`,
  isbnManualSinCatalogo: 'Todavía no tenemos el catálogo para buscar ese ISBN. Esperá a que cargue o tocá "Reintentar".',
  recursoDesconocido: (recurso: string) =>
    `No conocemos el permiso "${recurso}". La app solo usa la cámara y las notificaciones.`,
} as const;
