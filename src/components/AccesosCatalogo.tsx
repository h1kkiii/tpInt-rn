import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { ESPACIO } from '@/constants/tema';
import { useEstilos } from '@/hooks/useEstilos';

export function AccesosCatalogo() {
  const estilos = useEstilos(crearEstilos);
  const router = useRouter();
  return (
    <View style={estilos.fila}>
      <View style={estilos.celda}>
        <Boton titulo="Buscar" icono="search" variante="secundario" onPress={() => router.push('/buscar')} />
      </View>
      <View style={estilos.celda}>
        <Boton titulo="Escanear" icono="barcode-outline" variante="secundario" onPress={() => router.push('/escanear')} />
      </View>
    </View>
  );
}

const crearEstilos = () =>
  StyleSheet.create({
    fila: { flexDirection: 'row', gap: ESPACIO.m, paddingHorizontal: ESPACIO.l },
    celda: { flex: 1 },
  });
