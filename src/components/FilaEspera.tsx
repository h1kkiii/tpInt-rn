import { StyleSheet, Text, View } from 'react-native';

import { ALTO_LINEA, BORDE, ESPACIO, RADIO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import type { EsperaPropia } from '@/types/biblioteca';

type Props = {
  espera: EsperaPropia;
};

export function FilaEspera({ espera }: Props) {
  const estilos = useEstilos(crearEstilos);
  const posicion = espera.posicion === 1 ? 'Sos la próxima persona en la fila' : `Sos la persona N° ${espera.posicion} en la fila`;
  return (
    <View style={estilos.fila} accessible accessibilityLabel={`${espera.titulo}. ${posicion}`}>
      <Text style={estilos.titulo}>{espera.titulo}</Text>
      <Text style={estilos.posicion}>{posicion}</Text>
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    fila: {
      gap: ESPACIO.xs,
      padding: ESPACIO.l,
      marginHorizontal: ESPACIO.l,
      marginBottom: ESPACIO.s,
      backgroundColor: paleta.superficie,
      borderRadius: RADIO.normal,
      borderWidth: BORDE.fino,
      borderColor: paleta.borde,
    },
    titulo: { color: paleta.texto, fontSize: TAMANIO_TEXTO.mediano, lineHeight: ALTO_LINEA.mediano, fontWeight: '600' },
    posicion: { color: paleta.textoSecundario, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal },
  });
