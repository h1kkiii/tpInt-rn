import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ALTO_LINEA, ESPACIO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { useTema } from '@/hooks/useTema';

type Props = {
  texto: string;
};

export function Cargando({ texto }: Props) {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  return (
    <View style={estilos.contenedor} accessibilityLiveRegion="polite" accessible accessibilityLabel={texto}>
      <ActivityIndicator size="large" color={paleta.primario} />
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    contenedor: { alignItems: 'center', justifyContent: 'center', gap: ESPACIO.m, padding: ESPACIO.xl },
    texto: { color: paleta.textoSecundario, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal, textAlign: 'center' },
  });
