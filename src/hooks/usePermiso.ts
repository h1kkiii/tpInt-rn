import { PermissionStatus, type PermissionResponse } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';

import { useRevisarAlVolver } from '@/hooks/useRevisarAlVolver';
import { ADAPTADORES, estadoDesde, type EstadoPermiso, type Recurso } from '@/lib/permisos';

// Si el módulo nativo no responde, la pantalla no queda "cargando" para siempre:
// se trata como bloqueado y se ofrece la alternativa.
const SIN_ACCESO: PermissionResponse = {
  status: PermissionStatus.DENIED,
  granted: false,
  canAskAgain: false,
  expires: 'never',
};

export type ResultadoPermiso = {
  estado: EstadoPermiso;
  pedir: () => Promise<PermissionResponse>;
  consultar: () => Promise<PermissionResponse>;
  abrirAjustes: () => void;
};

// Se mantiene al día solo:
//  - al montar y cada vez que la pantalla recupera el foco (useFocusEffect),
//    por ejemplo al cerrarse el modal /permisos/[recurso];
//  - cada vez que la app vuelve a primer plano (AppState), por ejemplo desde Ajustes.
export function usePermiso(recurso: Recurso): ResultadoPermiso {
  const [respuesta, setRespuesta] = useState<PermissionResponse | null>(null);
  const montado = useRef(false);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const consultar = useCallback(async () => {
    let actual: PermissionResponse;
    try {
      actual = await ADAPTADORES[recurso].consultar();
    } catch {
      actual = SIN_ACCESO;
    }
    // Nunca se actualiza una pantalla que ya se desmontó mientras se esperaba.
    if (montado.current) setRespuesta(actual);
    return actual;
  }, [recurso]);

  const pedir = useCallback(async () => {
    let nueva: PermissionResponse;
    try {
      nueva = await ADAPTADORES[recurso].solicitar();
    } catch {
      nueva = SIN_ACCESO;
    }
    if (montado.current) setRespuesta(nueva);
    return nueva;
  }, [recurso]);

  const abrirAjustes = useCallback(() => {
    Linking.openSettings().catch(() => undefined);
  }, []);

  useFocusEffect(
    useCallback(() => {
      consultar();
    }, [consultar]),
  );

  const revisar = useCallback(() => {
    consultar();
  }, [consultar]);
  useRevisarAlVolver(revisar);

  return { estado: estadoDesde(respuesta), pedir, consultar, abrirAjustes };
}
