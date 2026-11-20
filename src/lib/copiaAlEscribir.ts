import { Cola } from '@/estructuras/Cola';
import { Pila } from '@/estructuras/Pila';

// Copia al escribir (B3): React decide si re-renderizar comparando referencias.
// Si se mutara la Cola o la Pila guardada en el estado, la referencia no cambia:
// la pantalla no se entera y el cambio aparece "a veces", con el próximo render
// que provoque otra cosa. Por eso cada cambio arma una estructura NUEVA desde
// aArray() y aplica el cambio sobre la copia; la original queda intacta.

export function colaDesde<T>(elementos: readonly T[]): Cola<T> {
  const cola = new Cola<T>();
  for (const elemento of elementos) cola.encolar(elemento);
  return cola;
}

export function pilaDesde<T>(elementos: readonly T[]): Pila<T> {
  const pila = new Pila<T>();
  for (const elemento of elementos) pila.push(elemento);
  return pila;
}

export function cambiarCola<T>(original: Cola<T>, cambio: (copia: Cola<T>) => void): Cola<T> {
  const copia = colaDesde(original.aArray());
  cambio(copia);
  return copia;
}

export function cambiarPila<T>(original: Pila<T>, cambio: (copia: Pila<T>) => void): Pila<T> {
  const copia = pilaDesde(original.aArray());
  cambio(copia);
  return copia;
}
