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

type ResultadoPermiso = {
  estado: EstadoPermiso;
  pedir: () => Promise<PermissionResponse>;
  abrirAjustes: () => void;
};

// Consulta sin diálogo; si el módulo falla, se trata como bloqueado.
async function leerPermiso(recurso: Recurso): Promise<PermissionResponse> {
  try {
    return await ADAPTADORES[recurso].consultar();
  } catch {
    return SIN_ACCESO;
  }
}

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

  // Cada foco pide el estado; si la pantalla pierde el foco (o se desmonta)
  // antes de la respuesta, la limpieza la descarta.
  useFocusEffect(
    useCallback(() => {
      let vigente = true;
      leerPermiso(recurso).then((actual) => {
        if (vigente && montado.current) setRespuesta(actual);
      });
      return () => {
        vigente = false;
      };
    }, [recurso]),
  );

  // Al volver de Ajustes (AppState): la suscripción se limpia en useRevisarAlVolver
  // y el ref montado evita actualizar una pantalla que ya no existe.
  const revisar = useCallback(() => {
    leerPermiso(recurso).then((actual) => {
      if (montado.current) setRespuesta(actual);
    });
  }, [recurso]);
  useRevisarAlVolver(revisar);

  return { estado: estadoDesde(respuesta), pedir, abrirAjustes };
}
