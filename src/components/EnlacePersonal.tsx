import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ESPACIO, MINIMO_TACTIL, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';

export function EnlacePersonal() {
  const estilos = useEstilos(crearEstilos);
  return (
    <Link href="/login" asChild>
      <Pressable accessibilityRole="button" accessibilityHint="Abre el ingreso del personal de la biblioteca" style={estilos.boton}>
        <Text style={estilos.texto}>Personal</Text>
      </Pressable>
    </Link>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    boton: {
      minHeight: MINIMO_TACTIL,
      minWidth: MINIMO_TACTIL,
      paddingHorizontal: ESPACIO.s,
      alignItems: 'center',
      justifyContent: 'center',
    },
    texto: { color: paleta.primario, fontSize: TAMANIO_TEXTO.normal, fontWeight: '600' },
  });
