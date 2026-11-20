import { StyleSheet, Text, View } from 'react-native';

import { AccesosCatalogo } from '@/components/AccesosCatalogo';
import { VistosRecientemente } from '@/components/VistosRecientemente';
import { ALTO_LINEA, ESPACIO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';

// Va como encabezado de la lista: siempre visible, aunque el catálogo cargue o falle.
export function EncabezadoCatalogo() {
  const estilos = useEstilos(crearEstilos);
  return (
    <View style={estilos.contenedor}>
      <VistosRecientemente />
      <AccesosCatalogo />
      <Text style={estilos.titulo} accessibilityRole="header">
        Todos los libros
      </Text>
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    contenedor: { gap: ESPACIO.l, paddingTop: ESPACIO.l, paddingBottom: ESPACIO.s },
    titulo: {
      color: paleta.texto,
      fontSize: TAMANIO_TEXTO.mediano,
      lineHeight: ALTO_LINEA.mediano,
      fontWeight: '700',
      paddingHorizontal: ESPACIO.l,
    },
  });
