import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { MENSAJES } from '@/constants/mensajes';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import { cancelarRecordatorio, consultarPermisoNotificaciones, programarRecordatorio } from '@/lib/notificaciones';
import type { Prestamo } from '@/types/biblioteca';

export type EstadoRecordatorio = {
  activo: boolean;
  ocupado: boolean;
  mensaje: string | null;
};

export type Recordatorios = {
  estadoDe: (prestamo: Prestamo) => EstadoRecordatorio;
  alternar: (prestamo: Prestamo, activar: boolean) => void;
  devolver: (isbn: string) => void;
};

async function permisoConcedido(): Promise<boolean> {
  try {
    return (await consultarPermisoNotificaciones()).granted;
  } catch {
    return false;
  }
}

export function useRecordatorios(): Recordatorios {
  const { prestamos, definirRecordatorio, devolver: devolverPrestamo } = useBiblioteca();
  const router = useRouter();
  // isbn del préstamo que espera la respuesta del modal de permisos.
  const [pendiente, setPendiente] = useState<string | null>(null);
  const pendienteRef = useRef<string | null>(null);
  const [ocupados, setOcupados] = useState<string[]>([]);
  const [mensajes, setMensajes] = useState<Record<string, string>>({});
  const prestamosRef = useRef(prestamos);
  const montado = useRef(false);

  useEffect(() => {
    prestamosRef.current = prestamos;
  }, [prestamos]);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const escribirMensaje = useCallback((isbn: string, mensaje: string | null) => {
    if (!montado.current) return;
    setMensajes((anteriores) => {
      const siguientes = { ...anteriores };
      if (mensaje === null) delete siguientes[isbn];
      else siguientes[isbn] = mensaje;
      return siguientes;
    });
  }, []);

  const marcarOcupado = useCallback((isbn: string, ocupado: boolean) => {
    if (!montado.current) return;
    setOcupados((anteriores) => (ocupado ? [...anteriores, isbn] : anteriores.filter((x) => x !== isbn)));
  }, []);

  const programar = useCallback(
    async (prestamo: Prestamo) => {
      marcarOcupado(prestamo.isbn, true);
      const id = await programarRecordatorio(prestamo);
      marcarOcupado(prestamo.isbn, false);
      if (id === null) {
        escribirMensaje(prestamo.isbn, MENSAJES.recordatorioNoProgramado);
        return;
      }
      // Si el libro se devolvió mientras se programaba, el préstamo ya no
      // existe: la notificación se cancela apenas se conoce su id.
      if (!definirRecordatorio(prestamo.isbn, id)) await cancelarRecordatorio(id);
    },
    [definirRecordatorio, escribirMensaje, marcarOcupado],
  );

  // Al volver del modal /permisos/notificaciones (la pantalla recupera el
  // foco) se consulta el permiso en ese momento y se decide. Lee el pendiente
  // de un ref para actuar solo en el evento de foco, no al marcarlo.
  useFocusEffect(
    useCallback(() => {
      const isbn = pendienteRef.current;
      if (isbn === null) return;
      pendienteRef.current = null;
      let vigente = true;

      permisoConcedido().then((concedido) => {
        if (!vigente) return;
        setPendiente(null);
        const prestamo = prestamosRef.current.find((p) => p.isbn === isbn);
        if (!prestamo) return;
        if (concedido) programar(prestamo);
        else escribirMensaje(isbn, MENSAJES.sinNotificaciones);
      });

      return () => {
        vigente = false;
      };
    }, [escribirMensaje, programar]),
  );

  const activar = useCallback(
    async (prestamo: Prestamo) => {
      escribirMensaje(prestamo.isbn, null);
      // El permiso se consulta recién ahora, al activar el interruptor.
      if (await permisoConcedido()) {
        await programar(prestamo);
        return;
      }
      pendienteRef.current = prestamo.isbn;
      if (montado.current) setPendiente(prestamo.isbn);
      router.push('/permisos/notificaciones');
    },
    [escribirMensaje, programar, router],
  );

  const desactivar = useCallback(
    (prestamo: Prestamo) => {
      escribirMensaje(prestamo.isbn, null);
      if (prestamo.notificacionId) cancelarRecordatorio(prestamo.notificacionId);
      definirRecordatorio(prestamo.isbn, null);
    },
    [definirRecordatorio, escribirMensaje],
  );

  const alternar = useCallback(
    (prestamo: Prestamo, encender: boolean) => {
      if (encender) activar(prestamo);
      else desactivar(prestamo);
    },
    [activar, desactivar],
  );

  // devolver() del Context devuelve el préstamo quitado: con su id se cancela
  // la notificación pendiente, así no queda ningún id huérfano.
  const devolver = useCallback(
    (isbn: string) => {
      escribirMensaje(isbn, null);
      const prestamo = devolverPrestamo(isbn);
      if (prestamo?.notificacionId) cancelarRecordatorio(prestamo.notificacionId);
    },
    [devolverPrestamo, escribirMensaje],
  );

  const estadoDe = useCallback(
    (prestamo: Prestamo): EstadoRecordatorio => {
      const ocupado = pendiente === prestamo.isbn || ocupados.includes(prestamo.isbn);
      return { activo: prestamo.recordatorio || ocupado, ocupado, mensaje: mensajes[prestamo.isbn] ?? null };
    },
    [mensajes, ocupados, pendiente],
  );

  return { estadoDe, alternar, devolver };
}
