import {
  AndroidImportance,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
} from 'expo-notifications';
import { Platform } from 'react-native';

// Canal de Android donde viajan los recordatorios de devolución.
export const CANAL_PRESTAMOS = 'prestamos';

// Android 13+ muestra el diálogo de POST_NOTIFICATIONS recién cuando la app
// tiene al menos un canal: por eso se crea ANTES de pedir el permiso.
// Devuelve false si no se pudo (Expo Go en Android puede fallar acá): en ese
// caso se sigue igual y la notificación usa el canal por defecto.
export async function crearCanalPrestamos(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    await setNotificationChannelAsync(CANAL_PRESTAMOS, {
      name: 'Préstamos',
      description: 'Recordatorios para devolver los libros a tiempo',
      importance: AndroidImportance.HIGH,
    });
    return true;
  } catch {
    return false;
  }
}

export function consultarPermisoNotificaciones() {
  return getPermissionsAsync();
}

// Puede mostrar el diálogo del sistema: llamar solo desde una acción de la persona.
export async function pedirPermisoNotificaciones() {
  await crearCanalPrestamos();
  return requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
}
