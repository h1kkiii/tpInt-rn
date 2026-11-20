import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { ALTO_LINEA, BORDE, ESPACIO, RADIO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { textoPersonas } from '@/lib/biblioteca';
import type { FilaMostrador } from '@/types/biblioteca';

type Props = {
  fila: FilaMostrador;
  onEntregar: (fila: FilaMostrador) => void;
};

export function TarjetaMostrador({ fila, onEntregar }: Props) {
  const estilos = useEstilos(crearEstilos);
  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>{fila.titulo}</Text>
      <Text style={estilos.dato}>Al frente: {fila.frente}</Text>
      <Text style={estilos.dato}>Esperando: {textoPersonas(fila.cantidad)}</Text>
      <Boton
        titulo="Entregar al siguiente"
        icono="hand-right-outline"
        onPress={() => onEntregar(fila)}
        accessibilityHint={`Entrega ${fila.titulo} a ${fila.frente} y la saca de la lista de espera`}
      />
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    tarjeta: {
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
    dato: { color: paleta.textoSecundario, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal },
  });
