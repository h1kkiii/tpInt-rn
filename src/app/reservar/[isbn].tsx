import { useLocalSearchParams } from 'expo-router';

import { Cargando } from '@/components/Cargando';
import { ConfirmacionReserva } from '@/components/ConfirmacionReserva';
import { LibroNoEncontrado } from '@/components/LibroNoEncontrado';
import { MensajeError } from '@/components/MensajeError';
import { MENSAJES } from '@/constants/mensajes';
import { useLibroPorIsbn } from '@/hooks/useLibroPorIsbn';

export default function Reservar() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const resultado = useLibroPorIsbn(isbn);

  switch (resultado.estado) {
    case 'invalido':
      return <LibroNoEncontrado titulo={MENSAJES.tituloIsbnInvalido} texto={MENSAJES.isbnInvalido(resultado.isbn)} />;
    case 'cargando':
      return <Cargando texto={MENSAJES.cargandoLibro} />;
    case 'error':
      return <MensajeError texto={MENSAJES.errorCatalogo} accion="Reintentar" onAccion={resultado.reintentar} />;
    case 'inexistente':
      return <LibroNoEncontrado titulo={MENSAJES.tituloLibroInexistente} texto={MENSAJES.libroInexistente(resultado.isbn)} />;
    case 'encontrado':
      return <ConfirmacionReserva libro={resultado.libro} />;
  }
}
