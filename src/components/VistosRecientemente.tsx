import { FlatList, StyleSheet, Text, View } from 'react-native';

import { TarjetaReciente } from '@/components/TarjetaReciente';
import { MENSAJES } from '@/constants/mensajes';
import { ALTO_LINEA, ESPACIO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import { useEstilos } from '@/hooks/useEstilos';

// Los datos salen del Context, no de la red: se ven aunque falle la carga del catálogo.
export function VistosRecientemente() {
  const estilos = useEstilos(crearEstilos);
  const { recientes } = useBiblioteca();
  return (
    <View style={estilos.seccion}>
      <Text style={estilos.titulo} accessibilityRole="header">
        Vistos recientemente
      </Text>
      <FlatList
        horizontal
        data={recientes}
        keyExtractor={(libro) => libro.isbn}
        renderItem={({ item }) => <TarjetaReciente libro={item} />}
        ListEmptyComponent={<Text style={estilos.vacio}>{MENSAJES.recientesVacio}</Text>}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={estilos.lista}
      />
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    seccion: { gap: ESPACIO.s },
    titulo: {
      color: paleta.texto,
      fontSize: TAMANIO_TEXTO.mediano,
      lineHeight: ALTO_LINEA.mediano,
      fontWeight: '700',
      paddingHorizontal: ESPACIO.l,
    },
    lista: { paddingHorizontal: ESPACIO.l, flexGrow: 1 },
    vacio: { flex: 1, color: paleta.textoSecundario, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal },
  });
