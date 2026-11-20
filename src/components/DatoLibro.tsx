import { StyleSheet, Text, View } from 'react-native';

import { ALTO_LINEA, BORDE, ESPACIO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';

type Props = {
  etiqueta: string;
  valor: string;
};

export function DatoLibro({ etiqueta, valor }: Props) {
  const estilos = useEstilos(crearEstilos);
  return (
    <View style={estilos.fila} accessible accessibilityLabel={`${etiqueta}: ${valor}`}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    fila: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: ESPACIO.m,
      paddingVertical: ESPACIO.s,
      borderBottomWidth: BORDE.fino,
      borderBottomColor: paleta.borde,
    },
    etiqueta: { color: paleta.textoSecundario, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal },
    valor: {
      color: paleta.texto,
      fontSize: TAMANIO_TEXTO.normal,
      lineHeight: ALTO_LINEA.normal,
      fontWeight: '600',
      flexShrink: 1,
      textAlign: 'right',
    },
  });
