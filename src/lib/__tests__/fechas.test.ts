import { formatearFecha, momentoRecordatorio, sumarDias } from '../fechas';

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

describe('momentoRecordatorio', () => {
  const ahora = new Date(2026, 10, 20, 10, 0, 0);
  const vence = new Date(2026, 10, 27, 10, 0, 0);

  it('en modo demostración llega a los segundos indicados', () => {
    expect(momentoRecordatorio(vence, ahora, true, 15)).toEqual({ tipo: 'segundos', segundos: 15 });
  });

  it('fuera de la demostración llega un día antes de la devolución', () => {
    expect(momentoRecordatorio(vence, ahora, false, 15)).toEqual({ tipo: 'fecha', fecha: new Date(2026, 10, 26, 10, 0, 0) });
  });

  it('si el día anterior ya pasó, no programa en el pasado', () => {
    const casiVencido = new Date(2026, 10, 20, 18, 0, 0);
    expect(momentoRecordatorio(casiVencido, ahora, false, 15)).toEqual({ tipo: 'segundos', segundos: 15 });
  });
});
