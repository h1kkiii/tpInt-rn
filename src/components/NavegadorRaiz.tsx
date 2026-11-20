import { Stack } from 'expo-router';
import { useState } from 'react';

export function NavegadorRaiz() {
  const [sesion] = useState(false);
  return (
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
  );
}
