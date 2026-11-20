import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { INFO_RECURSO, NOMBRE_APP_EN_AJUSTES } from '@/constants/permisos';
import { ALTO_LINEA, ESPACIO, RADIO, TAMANIO_ICONO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { useTema } from '@/hooks/useTema';
import type { Recurso } from '@/lib/permisos';

type Props = {
  recurso: Recurso;
  onAbrirAjustes: () => void;
};

// Bloqueado (canAskAgain = false): el sistema ya no muestra el diálogo, así
// que el único botón es "Abrir Ajustes", con los pasos según la plataforma.
export function PantallaBloqueado({ recurso, onAbrirAjustes }: Props) {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  const info = INFO_RECURSO[recurso];
  const pasos =
    Platform.OS === 'ios'
      ? ['Abrí Ajustes', `Bajá hasta ${NOMBRE_APP_EN_AJUSTES} y tocala`, info.pasoIos]
      : ['Abrí Ajustes → Apps', `Elegí ${NOMBRE_APP_EN_AJUSTES}`, info.pasoAndroid];

  return (
    <View style={estilos.contenedor}>
      <Ionicons name="lock-closed-outline" size={TAMANIO_ICONO.grande} color={paleta.peligro} />
      <Text style={estilos.titulo} accessibilityRole="header">
        {info.nombre}: permiso desactivado
      </Text>
      <Text style={estilos.texto}>El teléfono ya no nos deja preguntarte. Si querés usarla, habilitala en Ajustes:</Text>
      <View style={estilos.pasos}>
        {pasos.map((paso, indice) => (
          <Text key={paso} style={estilos.paso}>
            {indice + 1}. {paso}
          </Text>
        ))}
      </View>
      <Boton titulo="Abrir Ajustes" icono="settings-outline" onPress={onAbrirAjustes} />
      <Text style={estilos.nota}>{info.alternativa}</Text>
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    contenedor: { gap: ESPACIO.m },
    titulo: { color: paleta.texto, fontSize: TAMANIO_TEXTO.grande, lineHeight: ALTO_LINEA.grande, fontWeight: '700' },
    texto: { color: paleta.texto, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal },
    pasos: { backgroundColor: paleta.superficieAlterna, borderRadius: RADIO.normal, padding: ESPACIO.m },
    paso: { color: paleta.texto, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal, paddingVertical: ESPACIO.xs },
    nota: { color: paleta.textoSecundario, fontSize: TAMANIO_TEXTO.chico, lineHeight: ALTO_LINEA.chico },
  });
