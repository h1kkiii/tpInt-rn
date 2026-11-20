import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { BORDE, ESPACIO, MINIMO_TACTIL, RADIO, TAMANIO_ICONO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { useTema } from '@/hooks/useTema';

type Props = {
  valorInicial: string;
  onCambiar: (texto: string) => void;
};

// El texto vive en estado local (respuesta inmediata al tipear) y se espeja a
// la URL en cada cambio. Si el TextInput leyera directo de la URL, cada tecla
// esperaría la vuelta de setParams y el cursor podría saltar.
export function CampoBusqueda({ valorInicial, onCambiar }: Props) {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  const [texto, setTexto] = useState(valorInicial);

  function cambiar(nuevo: string) {
    setTexto(nuevo);
    onCambiar(nuevo);
  }

  return (
    <View style={estilos.campo}>
      <Ionicons name="search" size={TAMANIO_ICONO.chico} color={paleta.textoSecundario} />
      <TextInput
        value={texto}
        onChangeText={cambiar}
        placeholder="Título o autor"
        placeholderTextColor={paleta.textoSecundario}
        accessibilityLabel="Buscar por título o autor"
        autoFocus={valorInicial === ''}
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
        style={estilos.entrada}
      />
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    campo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ESPACIO.s,
      minHeight: MINIMO_TACTIL,
      marginHorizontal: ESPACIO.l,
      marginVertical: ESPACIO.m,
      paddingHorizontal: ESPACIO.m,
      backgroundColor: paleta.superficie,
      borderRadius: RADIO.normal,
      borderWidth: BORDE.fino,
      borderColor: paleta.borde,
    },
    entrada: { flex: 1, minHeight: MINIMO_TACTIL, fontSize: TAMANIO_TEXTO.normal, color: paleta.texto },
  });
