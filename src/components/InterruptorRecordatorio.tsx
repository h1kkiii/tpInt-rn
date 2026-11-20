import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { ALTO_LINEA, ESPACIO, MINIMO_TACTIL, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';
import { useTema } from '@/hooks/useTema';
import type { EstadoRecordatorio } from '@/hooks/useRecordatorios';

type Props = {
  titulo: string;
  estado: EstadoRecordatorio;
  onCambiar: (activar: boolean) => void;
};

// Toda la fila es el área táctil (al menos 44 de alto): el Switch nativo es
// más chico. El lector de pantalla anuncia un solo control con el nombre del libro.
export function InterruptorRecordatorio({ titulo, estado, onCambiar }: Props) {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  return (
    <View style={estilos.contenedor}>
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={`Recordarme devolver ${titulo}`}
        accessibilityState={{ checked: estado.activo, busy: estado.ocupado, disabled: estado.ocupado }}
        disabled={estado.ocupado}
        onPress={() => onCambiar(!estado.activo)}
        style={estilos.fila}
      >
        <Text style={estilos.etiqueta}>Recordarme</Text>
        <View pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Switch
            value={estado.activo}
            disabled={estado.ocupado}
            trackColor={{ false: paleta.borde, true: paleta.primario }}
            thumbColor={paleta.superficie}
            ios_backgroundColor={paleta.borde}
          />
        </View>
      </Pressable>
      {estado.mensaje && (
        <Text style={estilos.mensaje} accessibilityLiveRegion="polite">
          {estado.mensaje}
        </Text>
      )}
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    contenedor: { gap: ESPACIO.xs },
    fila: {
      minHeight: MINIMO_TACTIL,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    etiqueta: { color: paleta.texto, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal },
    mensaje: {
      color: paleta.textoAviso,
      backgroundColor: paleta.fondoAviso,
      padding: ESPACIO.s,
      fontSize: TAMANIO_TEXTO.chico,
      lineHeight: ALTO_LINEA.chico,
    },
  });
