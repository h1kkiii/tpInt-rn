import { useCallback, useEffect, useState } from 'react';

import { DEMORA_BUSQUEDA_MS } from '@/constants/biblioteca';
import { buscarLibros } from '@/lib/api';
import type { Libro } from '@/types';

type Respuesta = {
  consulta: string;
  intento: number;
  libros: Libro[];
  error: boolean;
};

type EstadoBusqueda = {
  libros: Libro[];
  cargando: boolean;
  error: boolean;
  reintentar: () => void;
};

export function useBusqueda(consulta: string): EstadoBusqueda {
  const [intento, setIntento] = useState(0);
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);

  useEffect(() => {
    if (consulta === '') return;
    let obsoleta = false;

    // Debounce: se pide recién cuando la persona deja de escribir 300 ms.
    const temporizador = setTimeout(async () => {
      try {
        const libros = await buscarLibros(consulta);
        if (!obsoleta) setRespuesta({ consulta, intento, libros, error: false });
      } catch {
        if (!obsoleta) setRespuesta({ consulta, intento, libros: [], error: true });
      }
    }, DEMORA_BUSQUEDA_MS);

    // Cada tecla limpia el efecto anterior: si el pedido no salió, se cancela;
    // si ya salió, su respuesta queda marcada como obsoleta y se descarta aunque
    // llegue después que la de la búsqueda nueva.
    return () => {
      clearTimeout(temporizador);
      obsoleta = true;
    };
  }, [consulta, intento]);

  const reintentar = useCallback(() => setIntento((anterior) => anterior + 1), []);

  const vigente = respuesta !== null && respuesta.consulta === consulta && respuesta.intento === intento;
  const cargando = consulta !== '' && !vigente;

  return {
    libros: vigente ? respuesta.libros : [],
    cargando,
    error: vigente && respuesta.error,
    reintentar,
  };
}
