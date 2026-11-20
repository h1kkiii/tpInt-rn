import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ESPACIO, MINIMO_TACTIL, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import { useEstilos } from '@/hooks/useEstilos';

// Sin sesión lleva al login; con sesión, directo al mostrador.
export function EnlacePersonal() {
  const estilos = useEstilos(crearEstilos);
  const { sesion } = useBiblioteca();
  return (
    <Link href={sesion ? '/mostrador' : '/login'} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityHint={sesion ? 'Abre el mostrador del personal' : 'Abre el ingreso del personal de la biblioteca'}
        style={estilos.boton}
      >
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
