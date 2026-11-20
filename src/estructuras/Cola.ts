// Sin shift(): se avanza el índice del frente para desencolar en O(1).
export class Cola<T> {
  #items: (T | undefined)[] = [];
  #inicio = 0;
  encolar(x: T): void { this.#items.push(x); }
  desencolar(): T | undefined {
    if (this.vacia) return undefined;
    const elemento = this.#items[this.#inicio];
    this.#items[this.#inicio] = undefined;
    this.#inicio++;
    return elemento;
  }
  frente(): T | undefined { return this.vacia ? undefined : this.#items[this.#inicio]; }
  get vacia(): boolean { return this.tamanio === 0; }
  get tamanio(): number { return this.#items.length - this.#inicio; }
  aArray(): T[] { return this.#items.slice(this.#inicio) as T[]; }
}
