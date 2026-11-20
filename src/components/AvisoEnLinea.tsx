import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { ALTO_LINEA, ESPACIO, RADIO, TAMANIO_ICONO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { useTema } from '@/hooks/useTema';

type Props = {
  texto: string;
};

// Aviso dentro de la pantalla (no un Alert): no interrumpe y lo anuncia el lector.
export function AvisoEnLinea({ texto }: Props) {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  return (
    <View style={estilos.aviso} accessibilityRole="alert" accessibilityLiveRegion="assertive">
      <Ionicons name="alert-circle-outline" size={TAMANIO_ICONO.normal} color={paleta.textoAviso} />
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    aviso: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ESPACIO.s,
      padding: ESPACIO.m,
      borderRadius: RADIO.normal,
      backgroundColor: paleta.fondoAviso,
    },
    texto: { flex: 1, color: paleta.textoAviso, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal },
  });
