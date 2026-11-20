import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { ALTO_LINEA, ESPACIO, TAMANIO_ICONO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { useTema } from '@/hooks/useTema';

type Props = {
  texto: string;
  accion: string;
  onAccion: () => void;
};

export function MensajeError({ texto, accion, onAccion }: Props) {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  return (
    <View style={estilos.contenedor} accessibilityLiveRegion="polite">
      <Ionicons name="cloud-offline-outline" size={TAMANIO_ICONO.grande} color={paleta.peligro} />
      <Text style={estilos.texto}>{texto}</Text>
      <Boton titulo={accion} icono="refresh" onPress={onAccion} />
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    contenedor: { alignItems: 'center', gap: ESPACIO.m, padding: ESPACIO.xl },
    texto: { color: paleta.texto, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal, textAlign: 'center' },
  });
