import { FlatList, StyleSheet, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { Cargando } from '@/components/Cargando';
import { MensajeError } from '@/components/MensajeError';
import { MensajeVacio } from '@/components/MensajeVacio';
import { TarjetaAviso } from '@/components/TarjetaAviso';
import { TarjetaMostrador } from '@/components/TarjetaMostrador';
import { MENSAJES } from '@/constants/mensajes';
import { ESPACIO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { useMostrador } from '@/hooks/useMostrador';

export function PanelMostrador() {
  const estilos = useEstilos(crearEstilos);
  const { filas, cargando, error, reintentar, confirmacion, descartarConfirmacion, entregar, salir } = useMostrador();

  let estadoSinFilas = <MensajeVacio texto={MENSAJES.mostradorVacio} icono="people-outline" />;
  if (cargando) estadoSinFilas = <Cargando texto={MENSAJES.cargandoMostrador} />;
  else if (error) estadoSinFilas = <MensajeError texto={MENSAJES.errorCatalogo} accion="Reintentar" onAccion={reintentar} />;

  return (
    <FlatList
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      contentInsetAdjustmentBehavior="automatic"
      data={filas}
      keyExtractor={(fila) => fila.isbn}
      renderItem={({ item }) => <TarjetaMostrador fila={item} onEntregar={entregar} />}
      ListHeaderComponent={
        confirmacion ? (
          <TarjetaAviso aviso={{ id: 'confirmacion', texto: confirmacion }} onDescartar={descartarConfirmacion} />
        ) : undefined
      }
      ListEmptyComponent={estadoSinFilas}
      ListFooterComponent={
        <View style={estilos.pie}>
          <Boton titulo="Cerrar sesión" icono="log-out-outline" variante="peligro" onPress={salir} />
        </View>
      }
    />
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: paleta.fondo },
    contenido: { paddingTop: ESPACIO.l, paddingBottom: ESPACIO.xl },
    pie: { paddingHorizontal: ESPACIO.l, paddingTop: ESPACIO.l },
  });
