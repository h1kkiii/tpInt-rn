import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ALTO_LINEA, ESPACIO, TAMANIO_ICONO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { useTema } from '@/hooks/useTema';

type Props = {
  texto: string;
  icono?: ComponentProps<typeof Ionicons>['name'];
};

export function MensajeVacio({ texto, icono = 'book-outline' }: Props) {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  return (
    <View style={estilos.contenedor}>
      <Ionicons name={icono} size={TAMANIO_ICONO.grande} color={paleta.textoSecundario} />
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    contenedor: { alignItems: 'center', gap: ESPACIO.m, padding: ESPACIO.xl },
    texto: { color: paleta.textoSecundario, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal, textAlign: 'center' },
  });
