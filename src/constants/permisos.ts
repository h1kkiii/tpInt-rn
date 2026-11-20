import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import type { Recurso } from '@/lib/permisos';

type InfoRecurso = {
  nombre: string;
  icono: ComponentProps<typeof Ionicons>['name'];
  titulo: string;
  beneficio: string;
  alternativa: string;
  // Último paso en Ajustes, según la plataforma.
  pasoAndroid: string;
  pasoIos: string;
};

export const INFO_RECURSO: Record<Recurso, InfoRecurso> = {
  camara: {
    nombre: 'Cámara',
    icono: 'camera-outline',
    titulo: 'Escaneá el libro',
    beneficio: 'Usamos tu cámara para leer el código de barras del libro y abrirlo al instante.',
    alternativa: 'Sin cámara podés escribir el ISBN a mano: está en la contratapa, debajo del código de barras.',
    pasoAndroid: 'Permisos → Cámara → "Permitir solo mientras se usa la app"',
    pasoIos: 'Activá el interruptor "Cámara"',
  },
  notificaciones: {
    nombre: 'Notificaciones',
    icono: 'notifications-outline',
    titulo: 'Te avisamos a tiempo',
    beneficio: 'Usamos las notificaciones para recordarte devolver el libro un día antes del vencimiento.',
    alternativa: 'Sin notificaciones la fecha de devolución queda siempre en Mis reservas, y los avisos aparecen ahí.',
    pasoAndroid: 'Notificaciones → activá "Todas las notificaciones"',
    pasoIos: 'Tocá "Notificaciones" → activá "Permitir notificaciones"',
  },
};

// En Expo Go los permisos son de Expo Go, no de "Biblioteca IPF".
export const NOMBRE_APP_EN_AJUSTES = 'Expo Go (o Biblioteca IPF si la instalaste)';
