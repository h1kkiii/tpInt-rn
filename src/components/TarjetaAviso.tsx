import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { BotonIcono } from '@/components/BotonIcono';
import { ALTO_LINEA, ESPACIO, RADIO, TAMANIO_ICONO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { useTema } from '@/hooks/useTema';
import type { Aviso } from '@/types/biblioteca';

type Props = {
  aviso: Aviso;
  onDescartar: (id: string) => void;
};

export function TarjetaAviso({ aviso, onDescartar }: Props) {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  return (
    <View style={estilos.tarjeta}>
      <Ionicons name="notifications-outline" size={TAMANIO_ICONO.normal} color={paleta.textoAviso} />
      <Text style={estilos.texto}>{aviso.texto}</Text>
      <BotonIcono
        icono="close"
        etiqueta={`Descartar aviso: ${aviso.texto}`}
        color={paleta.textoAviso}
        onPress={() => onDescartar(aviso.id)}
      />
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    tarjeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ESPACIO.s,
      paddingLeft: ESPACIO.m,
      paddingVertical: ESPACIO.xs,
      marginHorizontal: ESPACIO.l,
      marginBottom: ESPACIO.s,
      borderRadius: RADIO.normal,
      backgroundColor: paleta.fondoAviso,
    },
    texto: { flex: 1, color: paleta.textoAviso, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal },
  });
