// Los parámetros de ruta llegan como string, string[] (si la URL repite la
// clave, por ejemplo ?q=a&q=b) o undefined.
export type ParametroRuta = string | string[] | undefined;

export function primerValor(parametro: ParametroRuta): string {
  if (Array.isArray(parametro)) return parametro[0] ?? '';
  return parametro ?? '';
}

// Primer valor, sin espacios en los extremos y con los espacios internos colapsados.
export function normalizarConsulta(parametro: ParametroRuta): string {
  return primerValor(parametro).trim().replace(/\s+/g, ' ');
}

// Acepta lo que la persona escribe o copia: "978-84-9908-950-8" o "978 84 ...".
export function limpiarIsbn(texto: string): string {
  return texto.replace(/[\s-]/g, '');
}

export function esIsbnValido(isbn: string): boolean {
  return /^\d{13}$/.test(isbn);
}
