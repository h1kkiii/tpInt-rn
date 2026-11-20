import { useColorScheme } from 'react-native';

import { PALETAS, type Esquema, type Paleta } from '@/constants/tema';

// Sigue el modo del sistema (app.json: userInterfaceStyle "automatic").
export function useEsquema(): Esquema {
  return useColorScheme() === 'dark' ? 'oscura' : 'clara';
}

// Devuelve siempre el mismo objeto por esquema: useEstilos solo recalcula
// los estilos cuando la persona cambia de modo claro a oscuro.
export function useTema(): Paleta {
  return PALETAS[useEsquema()];
}
