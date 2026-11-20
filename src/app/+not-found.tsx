import { usePathname } from 'expo-router';

import { MensajeNoEncontrado } from '@/components/MensajeNoEncontrado';

export default function NoEncontrada() {
  const ruta = usePathname();
  return <MensajeNoEncontrado ruta={ruta} />;
}
