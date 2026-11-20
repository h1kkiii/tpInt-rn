import { SectionList, StyleSheet } from 'react-native';

import { EncabezadoSeccion } from '@/components/EncabezadoSeccion';
import { ItemReservas } from '@/components/ItemReservas';
import { MensajeVacio } from '@/components/MensajeVacio';
import { PieSeccion } from '@/components/PieSeccion';
import { MENSAJES } from '@/constants/mensajes';
import { ESPACIO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { useMisReservas } from '@/hooks/useMisReservas';
import { useRecordatorios } from '@/hooks/useRecordatorios';
import { claveItemReservas } from '@/lib/reservas';

export default function MisReservas() {
  const estilos = useEstilos(crearEstilos);
  const secciones = useMisReservas();
  const recordatorios = useRecordatorios();

  return (
    <SectionList
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      contentInsetAdjustmentBehavior="automatic"
      sections={secciones}
      keyExtractor={claveItemReservas}
      renderItem={({ item }) => <ItemReservas item={item} recordatorios={recordatorios} />}
      renderSectionHeader={({ section }) => <EncabezadoSeccion titulo={section.titulo} />}
      renderSectionFooter={({ section }) => <PieSeccion seccion={section} />}
      ListEmptyComponent={<MensajeVacio texto={MENSAJES.sinPrestamos} icono="bookmark-outline" />}
      stickySectionHeadersEnabled={false}
    />
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: paleta.fondo },
    contenido: { paddingBottom: ESPACIO.xl },
  });
