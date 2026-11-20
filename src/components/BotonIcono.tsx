import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { MINIMO_TACTIL, OPACIDAD, RADIO, TAMANIO_ICONO } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';

type Props = {
  icono: ComponentProps<typeof Ionicons>['name'];
  etiqueta: string;
  color: string;
  onPress: () => void;
};

// Botón de solo ícono: la etiqueta es obligatoria porque el lector de
// pantalla no tiene otro texto para anunciar.
export function BotonIcono({ icono, etiqueta, color, onPress }: Props) {
  const estilos = useEstilos(crearEstilos);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      onPress={onPress}
      style={({ pressed }) => [estilos.boton, pressed && estilos.presionado]}
    >
      <Ionicons name={icono} size={TAMANIO_ICONO.normal} color={color} />
    </Pressable>
  );
}

const crearEstilos = () =>
  StyleSheet.create({
    boton: {
      width: MINIMO_TACTIL,
      height: MINIMO_TACTIL,
      borderRadius: RADIO.pildora,
      alignItems: 'center',
      justifyContent: 'center',
    },
    presionado: { opacity: OPACIDAD.presionado },
  });
