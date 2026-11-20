import { MensajeVacio } from '@/components/MensajeVacio';
import type { SeccionReservas } from '@/types/biblioteca';

type Props = {
  seccion: SeccionReservas;
};

// Cada sección muestra su propio vacío (la lista entera nunca queda vacía:
// siempre están "Mis préstamos" y "En lista de espera").
export function PieSeccion({ seccion }: Props) {
  if (seccion.data.length > 0 || seccion.vacio === null) return null;
  return <MensajeVacio texto={seccion.vacio} icono="bookmark-outline" />;
}
