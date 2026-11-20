import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { DURACION_AVISO_ESCANER_MS } from '@/constants/biblioteca';
import { MENSAJES } from '@/constants/mensajes';
import { esIsbnValido, limpiarIsbn } from '@/lib/parametros';
import type { Libro } from '@/types';

export type ResultadoIngreso = { tipo: 'abierto' } | { tipo: 'error'; mensaje: string };

export function useLecturaIsbn(libros: Libro[], catalogoListo: boolean) {
  const router = useRouter();
  // useRef y no useState: onBarcodeScanned se llama muchas veces por segundo
  // y todas esas llamadas leen el MISMO render; un estado puesto en true recién
  // se vería en el render siguiente. El ref cambia en el acto.
  const navegando = useRef(false);
  const ultimoDesconocido = useRef<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Si la persona vuelve a esta pantalla (por ejemplo, desde /permisos/camara),
  // se puede volver a leer.
  useFocusEffect(
    useCallback(() => {
      navegando.current = false;
    }, []),
  );

  // El aviso de "ISBN desconocido" se borra solo a los 4 s; un código distinto
  // lo reemplaza y reinicia el temporizador (la limpieza cancela el anterior).
  useEffect(() => {
    if (aviso === null) return;
    const temporizador = setTimeout(() => setAviso(null), DURACION_AVISO_ESCANER_MS);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  const abrir = useCallback(
    (isbn: string) => {
      if (navegando.current) return;
      navegando.current = true;
      // Vuelve a la (tabs) existente y apila el detalle en el Stack del
      // Catálogo; el escáner sale de la pila (atrás no vuelve a la cámara).
      router.dismissTo({ pathname: '/libro/[isbn]', params: { isbn } });
    },
    [router],
  );

  const alLeer = useCallback(
    (codigo: string) => {
      if (navegando.current || !catalogoListo) return;
      const isbn = limpiarIsbn(codigo);
      if (libros.some((libro) => libro.isbn === isbn)) {
        abrir(isbn);
        return;
      }
      // El mismo código sigue frente a la cámara: no repetir el aviso.
      if (ultimoDesconocido.current === isbn) return;
      ultimoDesconocido.current = isbn;
      setAviso(MENSAJES.isbnEscaneadoDesconocido(isbn));
    },
    [abrir, catalogoListo, libros],
  );

  const ingresarAMano = useCallback(
    (texto: string): ResultadoIngreso => {
      const isbn = limpiarIsbn(texto);
      if (isbn === '') return { tipo: 'error', mensaje: MENSAJES.isbnManualVacio };
      if (/\D/.test(isbn)) return { tipo: 'error', mensaje: MENSAJES.isbnManualConLetras };
      if (!esIsbnValido(isbn)) return { tipo: 'error', mensaje: MENSAJES.isbnManualLargo(isbn.length) };
      if (!catalogoListo) return { tipo: 'error', mensaje: MENSAJES.isbnManualSinCatalogo };
      if (!libros.some((libro) => libro.isbn === isbn)) {
        return { tipo: 'error', mensaje: MENSAJES.libroInexistente(isbn) };
      }
      abrir(isbn);
      return { tipo: 'abierto' };
    },
    [abrir, catalogoListo, libros],
  );

  return { aviso, alLeer, ingresarAMano };
}
