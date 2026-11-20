import { colaDesde } from '../copiaAlEscribir';
import { armarSecciones, claveItemReservas, esperasDe } from '../reservas';
import type { Prestamo } from '@/types/biblioteca';

const prestamo: Prestamo = {
  isbn: '9788499089508',
  titulo: 'Ficciones',
  vence: '2026-11-27T13:00:00.000Z',
  recordatorio: false,
  notificacionId: null,
};

describe('esperasDe', () => {
  it('devuelve solo las filas donde está la persona, con título y posición', () => {
    const esperas = {
      '9789500401036': colaDesde(['Lucía', 'Tomás', 'Yo']),
      '9789500712347': colaDesde(['Pedro']),
    };
    const titulos = { '9789500401036': 'Sobre héroes y tumbas' };
    expect(esperasDe('Yo', esperas, titulos)).toEqual([
      { isbn: '9789500401036', titulo: 'Sobre héroes y tumbas', posicion: 3 },
    ]);
  });
});

describe('armarSecciones', () => {
  it('sin avisos arma solo préstamos y esperas, cada una con su texto de vacío', () => {
    const secciones = armarSecciones([], [], []);
    expect(secciones.map((s) => s.clave)).toEqual(['prestamos', 'esperas']);
    expect(secciones.every((s) => s.vacio !== null && s.data.length === 0)).toBe(true);
  });

  it('con avisos los pone primero', () => {
    const secciones = armarSecciones([{ id: 'a1', texto: 'Ya podés retirar Rayuela' }], [prestamo], []);
    expect(secciones.map((s) => s.clave)).toEqual(['avisos', 'prestamos', 'esperas']);
    expect(secciones[1].data).toHaveLength(1);
  });
});

describe('claveItemReservas', () => {
  it('usa el ISBN para libros y el id para avisos', () => {
    expect(claveItemReservas({ tipo: 'prestamo', isbn: prestamo.isbn, prestamo })).toBe(prestamo.isbn);
    expect(claveItemReservas({ tipo: 'aviso', aviso: { id: 'a1', texto: 'x' } })).toBe('a1');
  });
});
