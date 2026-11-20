import {
  AndroidImportance,
  cancelScheduledNotificationAsync,
  getAllScheduledNotificationsAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  scheduleNotificationAsync,
  SchedulableTriggerInputTypes,
  setNotificationChannelAsync,
  setNotificationHandler,
  type NotificationTriggerInput,
} from 'expo-notifications';
import { Platform } from 'react-native';

import { MODO_DEMOSTRACION, SEGUNDOS_DEMOSTRACION } from '@/constants/biblioteca';
import { formatearFecha, momentoRecordatorio } from '@/lib/fechas';
import type { Prestamo } from '@/types/biblioteca';

// Canal de Android donde viajan los recordatorios de devolución.
export const CANAL_PRESTAMOS = 'prestamos';

// Cómo se muestra una notificación que llega con la app abierta.
// Se llama una sola vez, desde el layout raíz.
export function configurarManejadorDeNotificaciones() {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

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

async function disparador(momento: ReturnType<typeof momentoRecordatorio>): Promise<NotificationTriggerInput> {
  const hayCanal = await crearCanalPrestamos();
  const channelId = hayCanal ? CANAL_PRESTAMOS : undefined;
  if (momento.tipo === 'segundos') {
    return { type: SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: momento.segundos, channelId };
  }
  return { type: SchedulableTriggerInputTypes.DATE, date: momento.fecha, channelId };
}

// Devuelve el identificador de la notificación programada, o null si no se
// pudo (sin permiso, módulo no disponible…): nunca rompe la pantalla.
export async function programarRecordatorio(prestamo: Prestamo): Promise<string | null> {
  try {
    const vence = new Date(prestamo.vence);
    const momento = momentoRecordatorio(vence, new Date(), MODO_DEMOSTRACION, SEGUNDOS_DEMOSTRACION);
    return await scheduleNotificationAsync({
      content: {
        title: 'Devolvé tu libro',
        body: `"${prestamo.titulo}" vence el ${formatearFecha(vence)}. Acordate de devolverlo a la biblioteca.`,
        data: { isbn: prestamo.isbn },
      },
      trigger: await disparador(momento),
    });
  } catch {
    return null;
  }
}

// Notificación inmediata de "ya podés retirar el libro". Devuelve false si no
// se pudo mostrar, para que quien llama use el aviso dentro de la app.
export async function notificarLibroDisponible(titulo: string): Promise<boolean> {
  try {
    const hayCanal = await crearCanalPrestamos();
    await scheduleNotificationAsync({
      content: { title: 'Tu libro te espera', body: `Ya podés retirar "${titulo}" en el mostrador de la biblioteca.` },
      trigger: hayCanal && Platform.OS === 'android' ? { channelId: CANAL_PRESTAMOS } : null,
    });
    return true;
  } catch {
    return false;
  }
}

// Ids de las notificaciones que el sistema tiene programadas, o null si no se
// pudo consultar (en ese caso no se toca nada de lo guardado).
export async function identificadoresProgramados(): Promise<Set<string> | null> {
  try {
    const programadas = await getAllScheduledNotificationsAsync();
    return new Set(programadas.map((notificacion) => notificacion.identifier));
  } catch {
    return null;
  }
}

export async function cancelarRecordatorio(notificacionId: string): Promise<void> {
  try {
    await cancelScheduledNotificationAsync(notificacionId);
  } catch {
    // Si ya se disparó o no existe, no hay nada que cancelar.
  }
}
