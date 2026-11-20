import { ScrollView, StyleSheet, Text } from 'react-native';

import { ESPACIO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';

type Props = {
  titulo: string;
};

export function PantallaProvisoria({ titulo }: Props) {
  const estilos = useEstilos(crearEstilos);
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={estilos.contenido} style={estilos.pantalla}>
      <Text style={estilos.titulo}>{titulo}</Text>
    </ScrollView>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: paleta.fondo },
    contenido: { padding: ESPACIO.l },
    titulo: { fontSize: TAMANIO_TEXTO.grande, color: paleta.texto },
  });
