import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { ALTO_LINEA, ESPACIO, FUENTE_MONO, MINIMO_TACTIL, RADIO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';

type Props = {
  ruta: string;
};

export function MensajeNoEncontrado({ ruta }: Props) {
  const estilos = useEstilos(crearEstilos);
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <Text style={estilos.titulo} accessibilityRole="header">
        Esta página no existe
      </Text>
      <Text style={estilos.texto}>No encontramos nada en la dirección:</Text>
      <Text style={estilos.ruta} selectable>
        {ruta}
      </Text>
      <Link href="/" replace asChild>
        <Pressable accessibilityRole="button" style={estilos.boton}>
          <Text style={estilos.textoBoton}>Ir al catálogo</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: paleta.fondo },
    contenido: { padding: ESPACIO.xl, gap: ESPACIO.m },
    titulo: { fontSize: TAMANIO_TEXTO.grande, lineHeight: ALTO_LINEA.grande, fontWeight: '700', color: paleta.texto },
    texto: { fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal, color: paleta.textoSecundario },
    ruta: {
      fontSize: TAMANIO_TEXTO.normal,
      lineHeight: ALTO_LINEA.normal,
      color: paleta.texto,
      backgroundColor: paleta.superficieAlterna,
      borderRadius: RADIO.chico,
      padding: ESPACIO.m,
      fontFamily: FUENTE_MONO,
    },
    boton: {
      minHeight: MINIMO_TACTIL,
      borderRadius: RADIO.normal,
      backgroundColor: paleta.primario,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: ESPACIO.l,
      marginTop: ESPACIO.s,
    },
    textoBoton: { color: paleta.sobrePrimario, fontSize: TAMANIO_TEXTO.normal, fontWeight: '600' },
  });
