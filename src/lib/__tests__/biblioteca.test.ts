import { colaDesde } from '../copiaAlEscribir';
import { calcularDisponibles, crearEstadoInicial, posicionEnEspera, preverReserva } from '../biblioteca';
import type { Libro } from '@/types';
import type { Prestamo } from '@/types/biblioteca';

const libro: Libro = { isbn: '9788499089508', titulo: 'Ficciones', autor: 'Jorge Luis Borges', anio: 2011, ejemplares: 1 };
const ahora = new Date(2026, 10, 20, 10, 0, 0);

function prestamoDe(isbn: string): Prestamo {
  return { isbn, titulo: 'x', vence: ahora.toISOString(), recordatorio: false, notificacionId: null };
}

describe('calcularDisponibles', () => {
  it('resta los préstamos activos del mismo libro', () => {
    expect(calcularDisponibles({ ...libro, ejemplares: 3 }, [prestamoDe(libro.isbn), prestamoDe('otro')])).toBe(2);
  });

  it('nunca baja de 0', () => {
    expect(calcularDisponibles({ ...libro, ejemplares: 0 }, [prestamoDe(libro.isbn)])).toBe(0);
  });
});

describe('posicionEnEspera', () => {
  it('cuenta desde 1 y devuelve null si la persona no está', () => {
    const cola = colaDesde(['Lucía', 'Tomás', 'Yo']);
    expect(posicionEnEspera(cola, 'Lucía')).toBe(1);
    expect(posicionEnEspera(cola, 'Yo')).toBe(3);
    expect(posicionEnEspera(cola, 'Ana')).toBeNull();
    expect(posicionEnEspera(undefined, 'Yo')).toBeNull();
  });
});

describe('preverReserva', () => {
  it('con ejemplares y sin fila es préstamo a 7 días', () => {
    const resultado = preverReserva(libro, [], undefined, 'Yo', ahora);
    expect(resultado.tipo).toBe('prestamo');
    if (resultado.tipo === 'prestamo') {
      const vence = new Date(resultado.vence);
      expect(vence.getDate()).toBe(27);
    }
  });

  it('sin ejemplares entra a la espera al final de la fila', () => {
    const resultado = preverReserva({ ...libro, ejemplares: 0 }, [], colaDesde(['Lucía', 'Tomás']), 'Yo', ahora);
    expect(resultado).toEqual({ tipo: 'espera', posicion: 3 });
  });

  it('si ya hay gente esperando respeta la fila aunque haya ejemplares', () => {
    const resultado = preverReserva(libro, [], colaDesde(['Pedro']), 'Yo', ahora);
    expect(resultado).toEqual({ tipo: 'espera', posicion: 2 });
  });

  it('no deja reservar dos veces: préstamo o espera existentes', () => {
    expect(preverReserva(libro, [prestamoDe(libro.isbn)], undefined, 'Yo', ahora)).toEqual({
      tipo: 'repetido',
      motivo: 'prestamo',
    });
    expect(preverReserva(libro, [], colaDesde(['Lucía', 'Yo']), 'Yo', ahora)).toEqual({
      tipo: 'repetido',
      motivo: 'espera',
    });
  });
});

describe('crearEstadoInicial', () => {
  it('arma las esperas iniciales como colas', () => {
    const estado = crearEstadoInicial();
    expect(estado.esperas['9789500401036'].aArray()).toEqual(['Lucía', 'Tomás']);
    expect(estado.esperas['9789500712347'].aArray()).toEqual(['Pedro']);
    expect(estado.prestamos).toEqual([]);
    expect(estado.recientes.vacia).toBe(true);
  });
});
