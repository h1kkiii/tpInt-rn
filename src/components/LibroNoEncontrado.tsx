import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Boton } from '@/components/Boton';
import { ALTO_LINEA, ESPACIO, TAMANIO_ICONO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { useTema } from '@/hooks/useTema';

type Props = {
  titulo: string;
  texto: string;
};

// ISBN inválido o inexistente: mensaje claro y una salida al Catálogo.
export function LibroNoEncontrado({ titulo, texto }: Props) {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  const router = useRouter();
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <Ionicons name="help-circle-outline" size={TAMANIO_ICONO.grande} color={paleta.textoSecundario} />
      <Text style={estilos.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      <Text style={estilos.texto}>{texto}</Text>
      <Boton titulo="Volver al catálogo" icono="library-outline" onPress={() => router.dismissTo('/')} />
    </ScrollView>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: paleta.fondo },
    contenido: { padding: ESPACIO.xl, gap: ESPACIO.m, alignItems: 'center' },
    titulo: { color: paleta.texto, fontSize: TAMANIO_TEXTO.grande, lineHeight: ALTO_LINEA.grande, fontWeight: '700', textAlign: 'center' },
    texto: { color: paleta.textoSecundario, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal, textAlign: 'center' },
  });
