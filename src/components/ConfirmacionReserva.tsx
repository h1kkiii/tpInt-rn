import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvisoEnLinea } from '@/components/AvisoEnLinea';
import { Boton } from '@/components/Boton';
import { USUARIO } from '@/constants/biblioteca';
import { MENSAJES } from '@/constants/mensajes';
import { ALTO_LINEA, ESPACIO, RADIO, TAMANIO_ICONO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import { useEstilos } from '@/hooks/useEstilos';
import { useTema } from '@/hooks/useTema';
import { posicionEnEspera, preverReserva } from '@/lib/biblioteca';
import { formatearFecha } from '@/lib/fechas';
import type { Libro } from '@/types';
import type { ResultadoReserva } from '@/types/biblioteca';

type Props = {
  libro: Libro;
};

export function ConfirmacionReserva({ libro }: Props) {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  const router = useRouter();
  const { prestamos, esperas, reservar } = useBiblioteca();
  const [ahora] = useState(() => new Date());
  const [confirmado, setConfirmado] = useState<ResultadoReserva | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Mientras el modal se cierra, el Context ya cambió (ahora sería "repetido"):
  // se sigue mostrando lo que se confirmó.
  const resultado = confirmado ?? preverReserva(libro, prestamos, esperas[libro.isbn], USUARIO, ahora);

  function confirmar() {
    const final = reservar(libro);
    if (final.tipo === 'repetido') {
      setAviso(MENSAJES.reservaRepetida);
      return;
    }
    setConfirmado(final);
    // Vuelve a la (tabs) existente y abre "Mis reservas": el modal sale de la
    // pila, así que atrás no vuelve a la confirmación.
    router.dismissTo('/reservas');
  }

  let titulo: string;
  let texto: string;
  if (resultado.tipo === 'prestamo') {
    titulo = 'Préstamo por 7 días';
    texto = `Te llevás el libro por 7 días; devolvelo antes del ${formatearFecha(new Date(resultado.vence))}.`;
  } else if (resultado.tipo === 'espera') {
    titulo = 'Lista de espera';
    texto = `No hay un ejemplar para vos ahora: vas a ser la persona N° ${resultado.posicion} en la lista de espera.`;
  } else if (resultado.motivo === 'prestamo') {
    titulo = 'Ya lo tenés';
    texto = 'Ya tenés este libro prestado. Podés ver la fecha de devolución en Mis reservas.';
  } else {
    titulo = 'Ya estás en la lista';
    texto = `Ya estás en la lista de espera de este libro (sos la persona N° ${posicionEnEspera(esperas[libro.isbn], USUARIO) ?? '?'}).`;
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <View style={estilos.cabecera}>
        <Ionicons
          name={resultado.tipo === 'prestamo' ? 'book-outline' : resultado.tipo === 'espera' ? 'time-outline' : 'information-circle-outline'}
          size={TAMANIO_ICONO.grande}
          color={paleta.primario}
        />
        <Text style={estilos.libro}>{libro.titulo}</Text>
        <Text style={estilos.autor}>{libro.autor}</Text>
      </View>
      <View style={estilos.bloque} accessibilityLiveRegion="polite">
        <Text style={estilos.titulo} accessibilityRole="header">
          {titulo}
        </Text>
        <Text style={estilos.texto}>{texto}</Text>
      </View>
      {aviso && <AvisoEnLinea texto={aviso} />}
      {resultado.tipo === 'repetido' ? (
        <Boton titulo="Ver mis reservas" icono="bookmark-outline" onPress={() => router.dismissTo('/reservas')} />
      ) : (
        <Boton titulo="Confirmar" icono="checkmark" onPress={confirmar} ocupado={confirmado !== null} />
      )}
      <Boton titulo="Cancelar" variante="secundario" onPress={() => router.back()} deshabilitado={confirmado !== null} />
    </ScrollView>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: paleta.fondo },
    contenido: { padding: ESPACIO.xl, gap: ESPACIO.l },
    cabecera: { alignItems: 'center', gap: ESPACIO.xs },
    libro: { color: paleta.texto, fontSize: TAMANIO_TEXTO.grande, lineHeight: ALTO_LINEA.grande, fontWeight: '700', textAlign: 'center' },
    autor: { color: paleta.textoSecundario, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal, textAlign: 'center' },
    bloque: { gap: ESPACIO.s, padding: ESPACIO.l, backgroundColor: paleta.superficie, borderRadius: RADIO.normal },
    titulo: { color: paleta.texto, fontSize: TAMANIO_TEXTO.mediano, lineHeight: ALTO_LINEA.mediano, fontWeight: '700' },
    texto: { color: paleta.texto, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal },
  });
