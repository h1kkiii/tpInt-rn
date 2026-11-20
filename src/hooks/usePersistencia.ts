import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { DEMORA_GUARDADO_MS } from '@/constants/biblioteca';
import { guardarEstado, leerEstadoGuardado } from '@/lib/almacenamiento';
import { crearEstadoInicial } from '@/lib/biblioteca';
import { identificadoresProgramados } from '@/lib/notificaciones';
import { deserializar, reconciliar, serializar } from '@/lib/persistencia';
import type { EstadoBiblioteca } from '@/types/biblioteca';

// Hidrata el estado al arrancar y lo guarda después de cada cambio.
// Devuelve si ya terminó de hidratar: hasta entonces no se escribe nada
// (si no, el estado inicial pisaría lo guardado).
export function usePersistencia(
  estado: EstadoBiblioteca,
  leerActual: () => EstadoBiblioteca,
  aplicar: (nuevo: EstadoBiblioteca) => void,
): boolean {
  const [hidratado, setHidratado] = useState(false);
  const hidratadoRef = useRef(false);

  useEffect(() => {
    let cancelado = false;

    async function hidratar() {
      const guardado = deserializar(await leerEstadoGuardado()) ?? crearEstadoInicial();
      // Si no se puede consultar el sistema, se deja todo como estaba.
      const programadas = await identificadoresProgramados();
      const final = programadas ? reconciliar(guardado, programadas) : guardado;
      if (cancelado) return;
      aplicar(final);
      hidratadoRef.current = true;
      setHidratado(true);
    }

    hidratar();
    return () => {
      cancelado = true;
    };
  }, [aplicar]);

  // Mientras se hidrata, la app no dibuja nada y sigue el splash.
  useEffect(() => {
    if (hidratado) SplashScreen.hideAsync().catch(() => undefined);
  }, [hidratado]);

  // Guardado con un pequeño debounce: varios cambios seguidos, una escritura.
  useEffect(() => {
    if (!hidratado) return;
    const temporizador = setTimeout(() => guardarEstado(serializar(estado)), DEMORA_GUARDADO_MS);
    return () => clearTimeout(temporizador);
  }, [estado, hidratado]);

  // Al pasar a segundo plano se guarda en el acto: si el sistema cierra la
  // app, el temporizador del debounce no llegaría a correr.
  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (nuevo) => {
      if (nuevo !== 'active' && hidratadoRef.current) guardarEstado(serializar(leerActual()));
    });
    return () => suscripcion.remove();
  }, [leerActual]);

  return hidratado;
}
