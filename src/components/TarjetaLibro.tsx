import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ALTO_LINEA, BORDE, ESPACIO, MINIMO_TACTIL, RADIO, TAMANIO_ICONO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { useTema } from '@/hooks/useTema';
import type { Libro } from '@/types';

type Props = {
  libro: Libro;
};

// push: desde el buscador (Stack raíz) apila el detalle encima, así "atrás"
// vuelve a los resultados en lugar de perder la búsqueda.
export function TarjetaLibro({ libro }: Props) {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  return (
    <Link push href={{ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${libro.titulo}, de ${libro.autor}, ${libro.anio}`}
        accessibilityHint="Abre el detalle del libro"
        style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}
      >
        <View style={estilos.textos}>
          <Text style={estilos.titulo}>{libro.titulo}</Text>
          <Text style={estilos.autor}>
            {libro.autor} · {libro.anio}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={TAMANIO_ICONO.chico} color={paleta.textoSecundario} />
      </Pressable>
    </Link>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    tarjeta: {
      minHeight: MINIMO_TACTIL,
      flexDirection: 'row',
      alignItems: 'center',
      gap: ESPACIO.m,
      padding: ESPACIO.l,
      marginHorizontal: ESPACIO.l,
      marginBottom: ESPACIO.s,
      backgroundColor: paleta.superficie,
      borderRadius: RADIO.normal,
      borderWidth: BORDE.fino,
      borderColor: paleta.borde,
    },
    presionada: { backgroundColor: paleta.superficieAlterna },
    textos: { flex: 1, gap: ESPACIO.xs },
    titulo: { color: paleta.texto, fontSize: TAMANIO_TEXTO.mediano, lineHeight: ALTO_LINEA.mediano, fontWeight: '600' },
    autor: { color: paleta.textoSecundario, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal },
  });
