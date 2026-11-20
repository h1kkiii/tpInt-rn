import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ALTO_LINEA, ANCHO_TARJETA_RECIENTE, BORDE, ESPACIO, MINIMO_TACTIL, RADIO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import type { LibroReciente } from '@/types/biblioteca';

type Props = {
  libro: LibroReciente;
};

export function TarjetaReciente({ libro }: Props) {
  const estilos = useEstilos(crearEstilos);
  return (
    <Link push href={{ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Visto recientemente: ${libro.titulo}, de ${libro.autor}`}
        style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}
      >
        <Text style={estilos.titulo} numberOfLines={2}>
          {libro.titulo}
        </Text>
        <Text style={estilos.autor} numberOfLines={1}>
          {libro.autor}
        </Text>
      </Pressable>
    </Link>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    tarjeta: {
      width: ANCHO_TARJETA_RECIENTE,
      minHeight: MINIMO_TACTIL,
      padding: ESPACIO.m,
      gap: ESPACIO.xs,
      marginRight: ESPACIO.s,
      backgroundColor: paleta.superficie,
      borderRadius: RADIO.normal,
      borderWidth: BORDE.fino,
      borderColor: paleta.borde,
    },
    presionada: { backgroundColor: paleta.superficieAlterna },
    titulo: { color: paleta.texto, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal, fontWeight: '600' },
    autor: { color: paleta.textoSecundario, fontSize: TAMANIO_TEXTO.chico, lineHeight: ALTO_LINEA.chico },
  });
