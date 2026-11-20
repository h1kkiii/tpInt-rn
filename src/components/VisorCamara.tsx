import { CameraView } from 'expo-camera';
import { useIsFocused } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ALTO_LINEA, ALTO_VISOR_CAMARA, ESPACIO, RADIO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';

type Props = {
  // undefined mientras el catálogo no está listo: la cámara no consume lecturas.
  onLeer: ((codigo: string) => void) | undefined;
};

export function VisorCamara({ onLeer }: Props) {
  const estilos = useEstilos(crearEstilos);
  // Solo con foco: al pasar a otra pantalla la cámara se apaga.
  const enfocada = useIsFocused();

  return (
    <View style={estilos.visor}>
      {enfocada && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['ean13'] }}
          onBarcodeScanned={onLeer ? ({ data }) => onLeer(data) : undefined}
          accessibilityLabel="Vista de la cámara para leer el código de barras"
        />
      )}
      <Text style={estilos.indicacion}>Apuntá al código de barras de la contratapa</Text>
    </View>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    visor: {
      height: ALTO_VISOR_CAMARA,
      borderRadius: RADIO.normal,
      overflow: 'hidden',
      backgroundColor: paleta.fondoCamara,
      justifyContent: 'flex-end',
    },
    indicacion: {
      color: paleta.sobreCamara,
      backgroundColor: paleta.fondoCamara,
      fontSize: TAMANIO_TEXTO.normal,
      lineHeight: ALTO_LINEA.normal,
      textAlign: 'center',
      padding: ESPACIO.s,
    },
  });
