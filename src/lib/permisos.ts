import { Camera, type PermissionResponse } from 'expo-camera';

import { consultarPermisoNotificaciones, pedirPermisoNotificaciones } from '@/lib/notificaciones';

export const RECURSOS = ['camara', 'notificaciones'] as const;
export type Recurso = (typeof RECURSOS)[number];

export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';

export function esRecurso(valor: unknown): valor is Recurso {
  return typeof valor === 'string' && (RECURSOS as readonly string[]).includes(valor);
}

// No alcanza con mirar `status`: 'denied' significa tanto "dijo que no, pero
// se le puede volver a preguntar" (primer rechazo en Android) como "ya no se
// puede preguntar" (segundo rechazo en Android, primero en iOS). Lo que separa
// "mostrar Continuar" de "mostrar Abrir Ajustes" es `canAskAgain`.
export function estadoDesde(respuesta: PermissionResponse | null): EstadoPermiso {
  if (!respuesta) return 'cargando';
  if (respuesta.granted) return 'concedido';
  if (respuesta.canAskAgain) return 'preguntable';
  return 'bloqueado';
}

type Adaptador = {
  // Nunca muestra un diálogo: solo lee el estado actual.
  consultar: () => Promise<PermissionResponse>;
  // Puede mostrar el diálogo del sistema.
  solicitar: () => Promise<PermissionResponse>;
};

// Un adaptador por recurso: usePermiso es el mismo hook para los dos.
export const ADAPTADORES: Record<Recurso, Adaptador> = {
  camara: {
    consultar: () => Camera.getCameraPermissionsAsync(),
    solicitar: () => Camera.requestCameraPermissionsAsync(),
  },
  notificaciones: {
    consultar: () => consultarPermisoNotificaciones(),
    solicitar: () => pedirPermisoNotificaciones(),
  },
};
