import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { INFO_RECURSO } from '@/constants/permisos';
import { ALTO_LINEA, ESPACIO, TAMANIO_ICONO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { useTema } from '@/hooks/useTema';

// El escáner nunca pide el permiso: abre la pantalla previa, que es la única
// que muestra el diálogo del sistema.
export function CamaraPreguntable() {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  const router = useRouter();
  return (
    <View style={estilos.contenedor}>
      <Ionicons name="camera-outline" size={TAMANIO_ICONO.grande} color={paleta.primario} />
      <Text style={estilos.texto}>{INFO_RECURSO.camara.beneficio}</Text>
      <Boton titulo="Usar la cámara" icono="camera-outline" onPress={() => router.push('/permisos/camara')} />
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    contenedor: { alignItems: 'center', gap: ESPACIO.m },
    texto: { color: paleta.texto, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal, textAlign: 'center' },
  });
