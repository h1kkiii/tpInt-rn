import { useCallback, useEffect, useState } from 'react';

import { obtenerLibros } from '@/lib/api';
import type { Libro } from '@/types';

type Respuesta = {
  intento: number;
  libros: Libro[];
  error: boolean;
};

export type EstadoLibros = {
  libros: Libro[];
  cargando: boolean;
  error: boolean;
  reintentar: () => void;
};

export function useLibros(): EstadoLibros {
  const [intento, setIntento] = useState(0);
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);

  useEffect(() => {
    // Si el efecto se limpia (desmontaje o nuevo intento) antes de que llegue
    // la respuesta, esa respuesta se descarta.
    let obsoleto = false;

    async function cargar() {
      try {
        const libros = await obtenerLibros();
        if (!obsoleto) setRespuesta({ intento, libros, error: false });
      } catch {
        if (!obsoleto) setRespuesta({ intento, libros: [], error: true });
      }
    }

    cargar();
    return () => {
      obsoleto = true;
    };
  }, [intento]);

  const reintentar = useCallback(() => setIntento((anterior) => anterior + 1), []);

  // "Cargando" se deriva: la última respuesta guardada no es la del intento
  // actual. Así el efecto no hace setState síncrono al empezar cada pedido.
  const cargando = respuesta === null || respuesta.intento !== intento;

  return {
    libros: cargando ? [] : respuesta.libros,
    cargando,
    error: !cargando && respuesta.error,
    reintentar,
  };
}
