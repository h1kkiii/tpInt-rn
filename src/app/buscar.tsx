import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';

import { CampoBusqueda } from '@/components/CampoBusqueda';
import { Cargando } from '@/components/Cargando';
import { MensajeError } from '@/components/MensajeError';
import { MensajeVacio } from '@/components/MensajeVacio';
import { TarjetaLibro } from '@/components/TarjetaLibro';
import { MENSAJES } from '@/constants/mensajes';
import { ESPACIO, type Paleta } from '@/constants/tema';
import { useBusqueda } from '@/hooks/useBusqueda';
import { useEstilos } from '@/hooks/useEstilos';
import { normalizarConsulta, primerValor } from '@/lib/parametros';

export default function Buscar() {
  const estilos = useEstilos(crearEstilos);
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const consulta = normalizarConsulta(q);
  const { libros, cargando, error, reintentar } = useBusqueda(consulta);

  let estadoSinResultados = <MensajeVacio texto={MENSAJES.sinResultados(consulta)} icono="search-outline" />;
  if (consulta === '') estadoSinResultados = <MensajeVacio texto={MENSAJES.busquedaVacia} icono="search-outline" />;
  else if (cargando) estadoSinResultados = <Cargando texto={MENSAJES.buscando} />;
  else if (error) estadoSinResultados = <MensajeError texto={MENSAJES.errorBusqueda} accion="Reintentar" onAccion={reintentar} />;

  return (
    <FlatList
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      data={libros}
      keyExtractor={(libro) => libro.isbn}
      renderItem={({ item }) => <TarjetaLibro libro={item} />}
      ListHeaderComponent={
        // setParams reemplaza el parámetro de la ruta actual: no apila pantallas.
        <CampoBusqueda valorInicial={primerValor(q)} onCambiar={(texto) => router.setParams({ q: texto })} />
      }
      ListEmptyComponent={estadoSinResultados}
    />
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: paleta.fondo },
    contenido: { paddingBottom: ESPACIO.xl },
  });
