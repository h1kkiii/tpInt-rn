import { Cola } from '../Cola';
import { Pila } from '../Pila';

describe('Pila', () => {
  it('saca primero el último que entró (LIFO)', () => {
    const pila = new Pila<string>();
    pila.push('a');
    pila.push('b');
    pila.push('c');
    expect(pila.pop()).toBe('c');
    expect(pila.pop()).toBe('b');
    expect(pila.tope()).toBe('a');
  });

  it('devuelve undefined al sacar de una pila vacía', () => {
    const pila = new Pila<number>();
    expect(pila.vacia).toBe(true);
    expect(pila.pop()).toBeUndefined();
    expect(pila.tope()).toBeUndefined();
  });

  it('actualiza tamanio al apilar y desapilar', () => {
    const pila = new Pila<number>();
    pila.push(1);
    pila.push(2);
    expect(pila.tamanio).toBe(2);
    pila.pop();
    expect(pila.tamanio).toBe(1);
    expect(pila.vacia).toBe(false);
  });

  it('aArray() devuelve una copia: modificarla no cambia la pila', () => {
    const pila = new Pila<number>();
    pila.push(1);
    pila.push(2);
    const copia = pila.aArray();
    copia.push(99);
    copia[0] = 42;
    expect(pila.aArray()).toEqual([1, 2]);
    expect(pila.tamanio).toBe(2);
  });
});

describe('Cola', () => {
  it('saca primero el primero que entró (FIFO)', () => {
    const cola = new Cola<string>();
    cola.encolar('Lucía');
    cola.encolar('Tomás');
    cola.encolar('Yo');
    expect(cola.desencolar()).toBe('Lucía');
    expect(cola.frente()).toBe('Tomás');
    expect(cola.desencolar()).toBe('Tomás');
    expect(cola.desencolar()).toBe('Yo');
  });

  it('devuelve undefined al desencolar una cola vacía y sigue funcionando', () => {
    const cola = new Cola<string>();
    expect(cola.desencolar()).toBeUndefined();
    expect(cola.frente()).toBeUndefined();
    expect(cola.tamanio).toBe(0);
    cola.encolar('Ana');
    cola.desencolar();
    expect(cola.desencolar()).toBeUndefined();
    expect(cola.tamanio).toBe(0);
    expect(cola.vacia).toBe(true);
  });

  it('actualiza tamanio al encolar y desencolar', () => {
    const cola = new Cola<number>();
    cola.encolar(1);
    cola.encolar(2);
    cola.encolar(3);
    expect(cola.tamanio).toBe(3);
    cola.desencolar();
    expect(cola.tamanio).toBe(2);
  });

  it('aArray() devuelve solo los que esperan y es una copia', () => {
    const cola = new Cola<number>();
    cola.encolar(1);
    cola.encolar(2);
    cola.encolar(3);
    cola.desencolar();
    const copia = cola.aArray();
    expect(copia).toEqual([2, 3]);
    copia.push(99);
    expect(cola.aArray()).toEqual([2, 3]);
    expect(cola.tamanio).toBe(2);
  });
});
