import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

// Llama a `revisar` cada vez que la app vuelve a primer plano (por ejemplo,
// desde Ajustes). El sistema no avisa si un permiso cambió afuera de la app.
// `revisar` tiene que ser una CONSULTA, nunca un pedido con diálogo.
export function useRevisarAlVolver(revisar: () => void) {
  const anterior = useRef(AppState.currentState);

  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (nuevo) => {
      const estabaAfuera = anterior.current !== 'active';
      anterior.current = nuevo;
      if (estabaAfuera && nuevo === 'active') revisar();
    });
    return () => suscripcion.remove();
  }, [revisar]);
}
