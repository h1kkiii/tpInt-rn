import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { INFO_RECURSO } from '@/constants/permisos';
import { ALTO_LINEA, ESPACIO, TAMANIO_ICONO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { useTema } from '@/hooks/useTema';
import type { Recurso } from '@/lib/permisos';

type Props = {
  recurso: Recurso;
  onContinuar: () => void;
  ocupado?: boolean;
};

// Antes del diálogo del sistema: beneficio en una frase y UN solo botón.
// "Continuar" y no "Permitir": la decisión real se toma en el diálogo.
export function PantallaPrevia({ recurso, onContinuar, ocupado = false }: Props) {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  const info = INFO_RECURSO[recurso];
  return (
    <View style={estilos.contenedor}>
      <Ionicons name={info.icono} size={TAMANIO_ICONO.grande} color={paleta.primario} />
      <Text style={estilos.titulo} accessibilityRole="header">
        {info.titulo}
      </Text>
      <Text style={estilos.texto}>{info.beneficio}</Text>
      <Boton titulo="Continuar" onPress={onContinuar} ocupado={ocupado} />
      <Text style={estilos.nota}>Podés cambiar esta decisión cuando quieras desde los Ajustes del teléfono.</Text>
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    contenedor: { gap: ESPACIO.m },
    titulo: { color: paleta.texto, fontSize: TAMANIO_TEXTO.grande, lineHeight: ALTO_LINEA.grande, fontWeight: '700' },
    texto: { color: paleta.texto, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal },
    nota: { color: paleta.textoSecundario, fontSize: TAMANIO_TEXTO.chico, lineHeight: ALTO_LINEA.chico },
  });
