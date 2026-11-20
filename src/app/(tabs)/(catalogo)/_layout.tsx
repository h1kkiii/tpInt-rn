import { Stack } from 'expo-router';

import { EnlacePersonal } from '@/components/EnlacePersonal';

export const unstable_settings = {
  anchor: 'index',
};

export default function LayoutCatalogo() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Catálogo', headerRight: () => <EnlacePersonal /> }} />
      <Stack.Screen name="libro/[isbn]" options={{ title: 'Libro' }} />
    </Stack>
  );
}
