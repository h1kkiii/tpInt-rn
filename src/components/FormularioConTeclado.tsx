import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet } from 'react-native';

import { ESPACIO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';

type Props = {
  children: ReactNode;
};

// El contenedor se achica cuando aparece el teclado y el contenido se puede
// desplazar, así el campo con foco nunca queda tapado.
export function FormularioConTeclado({ children }: Props) {
  const estilos = useEstilos(crearEstilos);
  return (
    <KeyboardAvoidingView behavior="padding" style={estilos.pantalla}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={estilos.contenido}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: paleta.fondo },
    contenido: { padding: ESPACIO.l, gap: ESPACIO.l },
  });
