import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { ALTO_LINEA, BORDE, ESPACIO, RADIO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { formatearFecha } from '@/lib/fechas';
import type { Prestamo } from '@/types/biblioteca';

type Props = {
  prestamo: Prestamo;
  onDevolver: (isbn: string) => void;
};

export function FilaPrestamo({ prestamo, onDevolver }: Props) {
  const estilos = useEstilos(crearEstilos);
  return (
    <View style={estilos.fila}>
      <Text style={estilos.titulo}>{prestamo.titulo}</Text>
      <Text style={estilos.fecha}>Devolvelo antes del {formatearFecha(new Date(prestamo.vence))}</Text>
      <Boton
        titulo="Devolver"
        icono="return-down-back"
        variante="secundario"
        onPress={() => onDevolver(prestamo.isbn)}
        accessibilityHint={`Devuelve ${prestamo.titulo} a la biblioteca`}
      />
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    fila: {
      gap: ESPACIO.s,
      padding: ESPACIO.l,
      marginHorizontal: ESPACIO.l,
      marginBottom: ESPACIO.s,
      backgroundColor: paleta.superficie,
      borderRadius: RADIO.normal,
      borderWidth: BORDE.fino,
      borderColor: paleta.borde,
    },
    titulo: { color: paleta.texto, fontSize: TAMANIO_TEXTO.mediano, lineHeight: ALTO_LINEA.mediano, fontWeight: '600' },
    fecha: { color: paleta.textoSecundario, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal },
  });
