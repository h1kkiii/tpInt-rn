import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';

import { useBiblioteca } from '@/hooks/useBiblioteca';
import { useEsquema, useTema } from '@/hooks/useTema';
import { crearTemaNavegacion } from '@/lib/temaNavegacion';

export function NavegadorRaiz() {
  const { sesion } = useBiblioteca();
  const esquema = useEsquema();
  const paleta = useTema();
  const temaNavegacion = useMemo(() => crearTemaNavegacion(esquema, paleta), [esquema, paleta]);

  return (
    <ThemeProvider value={temaNavegacion}>
      {/* "auto": texto claro en modo oscuro y oscuro en modo claro. */}
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="buscar" options={{ title: 'Buscar' }} />
        <Stack.Screen name="escanear" options={{ title: 'Escanear' }} />
        <Stack.Screen name="reservar/[isbn]" options={{ title: 'Reservar', presentation: 'modal' }} />
        <Stack.Screen name="permisos/[recurso]" options={{ title: 'Permiso', presentation: 'modal' }} />
        <Stack.Protected guard={!sesion} redirectTo="/mostrador">
          <Stack.Screen name="login" options={{ title: 'Ingreso del personal', presentation: 'modal' }} />
        </Stack.Protected>
        <Stack.Protected guard={sesion} redirectTo="/login">
          <Stack.Screen name="mostrador" options={{ title: 'Mostrador' }} />
        </Stack.Protected>
        <Stack.Screen name="reserva" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Página no encontrada' }} />
      </Stack>
    </ThemeProvider>
  );
}
