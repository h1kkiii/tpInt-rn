import { MENSAJES } from '@/constants/mensajes';
import type { Cola } from '@/estructuras/Cola';
import { posicionEnEspera } from '@/lib/biblioteca';
import type { Aviso, EsperaPropia, ItemReservas, Prestamo, SeccionReservas } from '@/types/biblioteca';

// Las esperas de la persona usuaria, con el título guardado en el Context
// (sin pedir nada a la red) y su posición en cada fila.
export function esperasDe(
  persona: string,
  esperas: Record<string, Cola<string>>,
  titulos: Record<string, string>,
): EsperaPropia[] {
  const propias: EsperaPropia[] = [];
  for (const [isbn, cola] of Object.entries(esperas)) {
    const posicion = posicionEnEspera(cola, persona);
    if (posicion !== null) propias.push({ isbn, titulo: titulos[isbn] ?? isbn, posicion });
  }
  return propias;
}

export function armarSecciones(
  avisos: readonly Aviso[],
  prestamos: readonly Prestamo[],
  esperas: readonly EsperaPropia[],
): SeccionReservas[] {
  const secciones: SeccionReservas[] = [];
  if (avisos.length > 0) {
    secciones.push({
      clave: 'avisos',
      titulo: 'Avisos',
      vacio: null,
      data: avisos.map((aviso) => ({ tipo: 'aviso', aviso })),
    });
  }
  secciones.push({
    clave: 'prestamos',
    titulo: 'Mis préstamos',
    vacio: MENSAJES.sinPrestamos,
    data: prestamos.map((prestamo) => ({ tipo: 'prestamo', isbn: prestamo.isbn, prestamo })),
  });
  secciones.push({
    clave: 'esperas',
    titulo: 'En lista de espera',
    vacio: MENSAJES.sinEsperas,
    data: esperas.map((espera) => ({ tipo: 'espera', isbn: espera.isbn, espera })),
  });
  return secciones;
}

// Los libros se identifican por ISBN; los avisos (que no son libros) por su id.
export function claveItemReservas(item: ItemReservas): string {
  return item.tipo === 'aviso' ? item.aviso.id : item.isbn;
}
