import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { DatoLibro } from '@/components/DatoLibro';
import { ALTO_LINEA, ESPACIO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import { useEstilos } from '@/hooks/useEstilos';
import { calcularDisponibles, personasEnEspera, textoPersonas } from '@/lib/biblioteca';
import type { Libro } from '@/types';

type Props = {
  libro: Libro;
};

export function DetalleLibro({ libro }: Props) {
  const estilos = useEstilos(crearEstilos);
  const router = useRouter();
  const { prestamos, esperas } = useBiblioteca();
  const disponibles = calcularDisponibles(libro, prestamos);
  const enEspera = personasEnEspera(esperas[libro.isbn]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <View style={estilos.cabecera}>
        <Text style={estilos.titulo} accessibilityRole="header">
          {libro.titulo}
        </Text>
        <Text style={estilos.autor}>{libro.autor}</Text>
      </View>
      <View>
        <DatoLibro etiqueta="Año" valor={String(libro.anio)} />
        <DatoLibro etiqueta="Ejemplares disponibles" valor={String(disponibles)} />
        <DatoLibro etiqueta="En lista de espera" valor={textoPersonas(enEspera)} />
        <DatoLibro etiqueta="ISBN" valor={libro.isbn} />
      </View>
      <Boton
        titulo="Reservar"
        icono="bookmark-outline"
        onPress={() => router.push({ pathname: '/reservar/[isbn]', params: { isbn: libro.isbn } })}
        accessibilityHint="Abre la confirmación de la reserva"
      />
    </ScrollView>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: paleta.fondo },
    contenido: { padding: ESPACIO.l, gap: ESPACIO.xl },
    cabecera: { gap: ESPACIO.xs },
    titulo: { color: paleta.texto, fontSize: TAMANIO_TEXTO.titulo, lineHeight: ALTO_LINEA.titulo, fontWeight: '700' },
    autor: { color: paleta.textoSecundario, fontSize: TAMANIO_TEXTO.mediano, lineHeight: ALTO_LINEA.mediano },
  });
