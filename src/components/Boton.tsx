import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { BORDE, ESPACIO, MINIMO_TACTIL, OPACIDAD, RADIO, TAMANIO_ICONO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { useTema } from '@/hooks/useTema';

type Variante = 'primario' | 'secundario' | 'peligro';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  icono?: ComponentProps<typeof Ionicons>['name'];
  deshabilitado?: boolean;
  ocupado?: boolean;
  accessibilityHint?: string;
};

export function Boton({ titulo, onPress, variante = 'primario', icono, deshabilitado = false, ocupado = false, accessibilityHint }: Props) {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  const inactivo = deshabilitado || ocupado;
  const colorTexto = { primario: paleta.sobrePrimario, secundario: paleta.primario, peligro: paleta.sobrePeligro }[variante];
  const estiloTexto = { primario: estilos.textoPrimario, secundario: estilos.textoSecundario, peligro: estilos.textoPeligro }[variante];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: ocupado }}
      accessibilityHint={accessibilityHint}
      disabled={inactivo}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        estilos[variante],
        pressed && estilos.presionado,
        inactivo && estilos.inactivo,
      ]}
    >
      {ocupado ? (
        <ActivityIndicator color={colorTexto} />
      ) : (
        icono && <Ionicons name={icono} size={TAMANIO_ICONO.chico} color={colorTexto} />
      )}
      <Text style={[estilos.texto, estiloTexto]}>{titulo}</Text>
    </Pressable>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    base: {
      minHeight: MINIMO_TACTIL,
      minWidth: MINIMO_TACTIL,
      borderRadius: RADIO.normal,
      paddingHorizontal: ESPACIO.l,
      paddingVertical: ESPACIO.s,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: ESPACIO.s,
    },
    primario: { backgroundColor: paleta.primario },
    secundario: { backgroundColor: paleta.superficie, borderWidth: BORDE.grueso, borderColor: paleta.primario },
    peligro: { backgroundColor: paleta.peligro },
    presionado: { opacity: OPACIDAD.presionado },
    inactivo: { opacity: OPACIDAD.inactivo },
    texto: { fontSize: TAMANIO_TEXTO.normal, fontWeight: '600' },
    textoPrimario: { color: paleta.sobrePrimario },
    textoSecundario: { color: paleta.primario },
    textoPeligro: { color: paleta.sobrePeligro },
  });
