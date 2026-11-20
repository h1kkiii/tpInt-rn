import { StyleSheet, Text } from 'react-native';

import { ALTO_LINEA, ESPACIO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';

type Props = {
  titulo: string;
};

export function EncabezadoSeccion({ titulo }: Props) {
  const estilos = useEstilos(crearEstilos);
  return (
    <Text style={estilos.titulo} accessibilityRole="header">
      {titulo}
    </Text>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    titulo: {
      color: paleta.texto,
      backgroundColor: paleta.fondo,
      fontSize: TAMANIO_TEXTO.mediano,
      lineHeight: ALTO_LINEA.mediano,
      fontWeight: '700',
      paddingHorizontal: ESPACIO.l,
      paddingTop: ESPACIO.l,
      paddingBottom: ESPACIO.s,
    },
  });
