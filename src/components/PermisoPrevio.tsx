import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { Cargando } from '@/components/Cargando';
import { PantallaBloqueado } from '@/components/PantallaBloqueado';
import { PantallaPrevia } from '@/components/PantallaPrevia';
import { INFO_RECURSO } from '@/constants/permisos';
import { ALTO_LINEA, ESPACIO, TAMANIO_ICONO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useCerrarModal } from '@/hooks/useCerrarModal';
import { useEstilos } from '@/hooks/useEstilos';
import { usePermiso } from '@/hooks/usePermiso';
import { useTema } from '@/hooks/useTema';
import type { Recurso } from '@/lib/permisos';

type Props = {
  recurso: Recurso;
};

export function PermisoPrevio({ recurso }: Props) {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  const permiso = usePermiso(recurso);
  const cerrar = useCerrarModal();
  const [pidiendo, setPidiendo] = useState(false);

  // Pide y cierra, diga lo que diga el sistema: la pantalla que abrió el
  // modal vuelve a consultar al recuperar el foco y decide qué mostrar.
  async function continuar() {
    setPidiendo(true);
    await permiso.pedir();
    cerrar();
  }

  let contenido;
  if (permiso.estado === 'cargando') {
    contenido = <Cargando texto="Revisando el permiso…" />;
  } else if (permiso.estado === 'preguntable') {
    contenido = <PantallaPrevia recurso={recurso} onContinuar={continuar} ocupado={pidiendo} />;
  } else if (permiso.estado === 'bloqueado') {
    contenido = <PantallaBloqueado recurso={recurso} onAbrirAjustes={permiso.abrirAjustes} />;
  } else {
    contenido = (
      <View style={estilos.listo}>
        <Ionicons name="checkmark-circle-outline" size={TAMANIO_ICONO.grande} color={paleta.exito} />
        <Text style={estilos.texto}>{INFO_RECURSO[recurso].nombre}: el permiso ya está concedido.</Text>
        <Boton titulo="Volver" onPress={cerrar} />
      </View>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      {contenido}
    </ScrollView>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: paleta.fondo },
    contenido: { padding: ESPACIO.xl, flexGrow: 1, justifyContent: 'center' },
    listo: { alignItems: 'center', gap: ESPACIO.m },
    texto: { color: paleta.texto, fontSize: TAMANIO_TEXTO.mediano, lineHeight: ALTO_LINEA.mediano, textAlign: 'center' },
  });
