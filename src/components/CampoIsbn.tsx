import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { ALTO_LINEA, BORDE, ESPACIO, FUENTE_MONO, MINIMO_TACTIL, RADIO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { useTema } from '@/hooks/useTema';
import type { ResultadoIngreso } from '@/hooks/useLecturaIsbn';

type Props = {
  onIngresar: (texto: string) => ResultadoIngreso;
};

// Alternativa que funciona siempre, con o sin cámara.
export function CampoIsbn({ onIngresar }: Props) {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);

  function abrir() {
    const resultado = onIngresar(texto);
    setError(resultado.tipo === 'error' ? resultado.mensaje : null);
  }

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta} nativeID="etiqueta-isbn">
        Escribí el ISBN a mano
      </Text>
      <View style={estilos.fila}>
        <TextInput
          value={texto}
          onChangeText={(nuevo) => {
            setTexto(nuevo);
            setError(null);
          }}
          onSubmitEditing={abrir}
          placeholder="978…"
          placeholderTextColor={paleta.textoSecundario}
          keyboardType="number-pad"
          returnKeyType="go"
          maxLength={20}
          accessibilityLabel="ISBN del libro"
          accessibilityLabelledBy="etiqueta-isbn"
          style={estilos.entrada}
        />
        <Boton titulo="Abrir" onPress={abrir} />
      </View>
      {error && (
        <Text style={estilos.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    contenedor: { gap: ESPACIO.s },
    etiqueta: { color: paleta.texto, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal, fontWeight: '600' },
    fila: { flexDirection: 'row', gap: ESPACIO.s, alignItems: 'center' },
    entrada: {
      flex: 1,
      minHeight: MINIMO_TACTIL,
      paddingHorizontal: ESPACIO.m,
      backgroundColor: paleta.superficie,
      borderWidth: BORDE.fino,
      borderColor: paleta.borde,
      borderRadius: RADIO.normal,
      color: paleta.texto,
      fontSize: TAMANIO_TEXTO.normal,
      fontFamily: FUENTE_MONO,
    },
    error: { color: paleta.peligro, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal },
  });
