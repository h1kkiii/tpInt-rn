import * as SplashScreen from 'expo-splash-screen';

import { NavegadorRaiz } from '@/components/NavegadorRaiz';
import { BibliotecaProvider } from '@/context/BibliotecaContext';
import { configurarManejadorDeNotificaciones } from '@/lib/notificaciones';

// El splash queda visible hasta que el provider termina de leer lo guardado.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

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
