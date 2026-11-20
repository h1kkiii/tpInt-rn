import AsyncStorage from '@react-native-async-storage/async-storage';

// Clave versionada: si cambia la forma de lo guardado, se cambia la versión
// y lo viejo se ignora en lugar de leerse mal.
const CLAVE = 'biblioteca-ipf/estado@v1';

export async function leerEstadoGuardado(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

export async function guardarEstado(texto: string): Promise<void> {
  try {
    await AsyncStorage.setItem(CLAVE, texto);
  } catch {
    // Si no se pudo guardar, la app sigue funcionando con lo que tiene en memoria.
  }
}
