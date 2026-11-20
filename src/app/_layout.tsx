import { NavegadorRaiz } from '@/components/NavegadorRaiz';
import { BibliotecaProvider } from '@/context/BibliotecaContext';
import { configurarManejadorDeNotificaciones } from '@/lib/notificaciones';

// Una sola vez, al cargar la app: cómo se muestran las notificaciones con la app abierta.
configurarManejadorDeNotificaciones();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function LayoutRaiz() {
  return (
    <BibliotecaProvider>
      <NavegadorRaiz />
    </BibliotecaProvider>
  );
}
