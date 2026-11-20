import { formatearFecha, sumarDias } from '../fechas';

describe('formatearFecha', () => {
  it('escribe día de la semana, número y mes en español', () => {
    expect(formatearFecha(new Date(2026, 10, 27))).toBe('viernes 27 de noviembre');
    expect(formatearFecha(new Date(2026, 0, 1))).toBe('jueves 1 de enero');
  });
});

describe('sumarDias', () => {
  it('pasa de mes y de año', () => {
    expect(formatearFecha(sumarDias(new Date(2026, 11, 28), 7))).toBe('lunes 4 de enero');
  });

  it('no modifica la fecha original', () => {
    const original = new Date(2026, 10, 20);
    sumarDias(original, 7);
    expect(original.getDate()).toBe(20);
  });
});
