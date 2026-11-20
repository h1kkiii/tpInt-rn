import { cambiarCola, cambiarPila, colaDesde, pilaDesde } from '../copiaAlEscribir';

describe('copia al escribir', () => {
  it('cambiarCola devuelve una cola nueva y no toca la original', () => {
    const original = colaDesde(['Lucía', 'Tomás']);
    const nueva = cambiarCola(original, (copia) => copia.encolar('Yo'));
    expect(nueva).not.toBe(original);
    expect(nueva.aArray()).toEqual(['Lucía', 'Tomás', 'Yo']);
    expect(original.aArray()).toEqual(['Lucía', 'Tomás']);
    expect(original.tamanio).toBe(2);
  });

  it('desencolar en la copia no saca a nadie de la original', () => {
    const original = colaDesde(['Lucía', 'Tomás']);
    const nueva = cambiarCola(original, (copia) => {
      copia.desencolar();
    });
    expect(nueva.frente()).toBe('Tomás');
    expect(original.frente()).toBe('Lucía');
  });

  it('cambiarPila devuelve una pila nueva y no toca la original', () => {
    const original = pilaDesde([1, 2]);
    const nueva = cambiarPila(original, (copia) => copia.push(3));
    expect(nueva).not.toBe(original);
    expect(nueva.tope()).toBe(3);
    expect(original.tope()).toBe(2);
    expect(original.tamanio).toBe(2);
  });
});
