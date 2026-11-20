import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MENSAJES } from '@/constants/mensajes';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import { useLibros } from '@/hooks/useLibros';
import { filasMostrador } from '@/lib/mostrador';
import { consultarPermisoNotificaciones, notificarLibroDisponible } from '@/lib/notificaciones';
import type { FilaMostrador } from '@/types/biblioteca';

async function permisoConcedido(): Promise<boolean> {
  try {
    return (await consultarPermisoNotificaciones()).granted;
  } catch {
    return false;
  }
}

export function useMostrador() {
  const router = useRouter();
  const { esperas, entregarAlSiguiente, agregarAviso, cerrarSesion } = useBiblioteca();
  const { libros, cargando, error, reintentar } = useLibros();
  const [confirmacion, setConfirmacion] = useState<string | null>(null);
  const cerrandoSesion = useRef(false);
  const montado = useRef(false);

  const filas = useMemo(() => filasMostrador(libros, esperas), [libros, esperas]);

  // "Cerrar sesión" primero vuelve al Catálogo y recién cuando esta pantalla
  // se desmonta cierra la sesión: si se cerrara antes, la protección de
  // /mostrador (redirectTo="/login") mandaría a la persona al login.
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
      if (cerrandoSesion.current) cerrarSesion();
    };
  }, [cerrarSesion]);

  const entregar = useCallback(
    async (fila: FilaMostrador) => {
      const resultado = entregarAlSiguiente(fila);
      if (resultado.tipo === 'sin-espera') {
        setConfirmacion(MENSAJES.sinEspera);
        return;
      }
      setConfirmacion(
        resultado.esUsuario
          ? MENSAJES.entregadoAUsuario(resultado.titulo)
          : MENSAJES.entregado(resultado.titulo, resultado.persona),
      );
      if (!resultado.esUsuario) return;
      // Se consulta el permiso EN ESTE MOMENTO (puede haber cambiado en Ajustes):
      // con permiso, notificación; sin permiso o si falla, aviso en la app. Nunca las dos.
      const notificada = (await permisoConcedido()) && (await notificarLibroDisponible(resultado.titulo));
      if (!notificada) agregarAviso(MENSAJES.yaPodesRetirar(resultado.titulo));
    },
    [agregarAviso, entregarAlSiguiente],
  );

  const salir = useCallback(() => {
    cerrandoSesion.current = true;
    router.dismissTo('/');
  }, [router]);

  const descartarConfirmacion = useCallback(() => {
    if (montado.current) setConfirmacion(null);
  }, []);

  return { filas, cargando, error, reintentar, confirmacion, descartarConfirmacion, entregar, salir };
}
