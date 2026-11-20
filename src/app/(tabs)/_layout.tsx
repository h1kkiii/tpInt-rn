import { Tabs } from 'expo-router/js-tabs';

import { IconoTab } from '@/components/IconoTab';

export default function LayoutTabs() {
  return (
    <Tabs>
      <Tabs.Screen
        name="(catalogo)"
        options={{
          title: 'Catálogo',
          headerShown: false,
          tabBarIcon: ({ focused }) => <IconoTab activo="library" inactivo="library-outline" enfocado={focused} />,
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Mis reservas',
          tabBarIcon: ({ focused }) => <IconoTab activo="bookmark" inactivo="bookmark-outline" enfocado={focused} />,
        }}
      />
    </Tabs>
  );
}
