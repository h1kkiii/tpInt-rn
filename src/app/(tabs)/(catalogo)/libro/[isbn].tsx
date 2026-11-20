import { Stack, useLocalSearchParams } from 'expo-router';

import { Cargando } from '@/components/Cargando';
import { DetalleLibro } from '@/components/DetalleLibro';
import { LibroNoEncontrado } from '@/components/LibroNoEncontrado';
import { MensajeError } from '@/components/MensajeError';
import { MENSAJES } from '@/constants/mensajes';
import { useLibroPorIsbn } from '@/hooks/useLibroPorIsbn';
import { useRegistrarReciente } from '@/hooks/useRegistrarReciente';

export default function Libro() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const resultado = useLibroPorIsbn(isbn);
  useRegistrarReciente(resultado.estado === 'encontrado' ? resultado.libro : null);

  const titulo = resultado.estado === 'encontrado' ? resultado.libro.titulo : 'Libro';

  return (
    <>
      <Stack.Screen options={{ title: titulo }} />
      {resultado.estado === 'invalido' && (
        <LibroNoEncontrado titulo={MENSAJES.tituloIsbnInvalido} texto={MENSAJES.isbnInvalido(resultado.isbn)} />
      )}
      {resultado.estado === 'cargando' && <Cargando texto={MENSAJES.cargandoLibro} />}
      {resultado.estado === 'error' && (
        <MensajeError texto={MENSAJES.errorCatalogo} accion="Reintentar" onAccion={resultado.reintentar} />
      )}
      {resultado.estado === 'inexistente' && (
        <LibroNoEncontrado titulo={MENSAJES.tituloLibroInexistente} texto={MENSAJES.libroInexistente(resultado.isbn)} />
      )}
      {resultado.estado === 'encontrado' && <DetalleLibro libro={resultado.libro} />}
    </>
  );
}
