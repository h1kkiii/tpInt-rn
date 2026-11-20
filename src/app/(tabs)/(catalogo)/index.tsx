import { FlatList, StyleSheet } from 'react-native';

import { Cargando } from '@/components/Cargando';
import { EncabezadoCatalogo } from '@/components/EncabezadoCatalogo';
import { MensajeError } from '@/components/MensajeError';
import { MensajeVacio } from '@/components/MensajeVacio';
import { TarjetaLibro } from '@/components/TarjetaLibro';
import { MENSAJES } from '@/constants/mensajes';
import { ESPACIO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { useLibros } from '@/hooks/useLibros';

export default function Catalogo() {
  const estilos = useEstilos(crearEstilos);
  const { libros, cargando, error, reintentar } = useLibros();

  let estadoSinLibros = <MensajeVacio texto={MENSAJES.catalogoVacio} />;
  if (cargando) estadoSinLibros = <Cargando texto={MENSAJES.cargandoCatalogo} />;
  else if (error) estadoSinLibros = <MensajeError texto={MENSAJES.errorCatalogo} accion="Reintentar" onAccion={reintentar} />;

  return (
    <FlatList
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      contentInsetAdjustmentBehavior="automatic"
      data={libros}
      keyExtractor={(libro) => libro.isbn}
      renderItem={({ item }) => <TarjetaLibro libro={item} />}
      ListHeaderComponent={<EncabezadoCatalogo />}
      ListEmptyComponent={estadoSinLibros}
    />
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: paleta.fondo },
    contenido: { paddingBottom: ESPACIO.xl },
  });
