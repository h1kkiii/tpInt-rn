import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Boton } from '@/components/Boton';
import { MENSAJES } from '@/constants/mensajes';
import { ALTO_LINEA, ESPACIO, TAMANIO_ICONO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useCerrarModal } from '@/hooks/useCerrarModal';
import { useEstilos } from '@/hooks/useEstilos';
import { useTema } from '@/hooks/useTema';

type Props = {
  recurso: string;
};

export function RecursoDesconocido({ recurso }: Props) {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  const cerrar = useCerrarModal();
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <Ionicons name="help-circle-outline" size={TAMANIO_ICONO.grande} color={paleta.textoSecundario} />
      <Text style={estilos.texto}>{MENSAJES.recursoDesconocido(recurso)}</Text>
      <Boton titulo="Volver" onPress={cerrar} />
    </ScrollView>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: paleta.fondo },
    contenido: { padding: ESPACIO.xl, gap: ESPACIO.m, alignItems: 'center', flexGrow: 1, justifyContent: 'center' },
    texto: { color: paleta.texto, fontSize: TAMANIO_TEXTO.mediano, lineHeight: ALTO_LINEA.mediano, textAlign: 'center' },
  });
