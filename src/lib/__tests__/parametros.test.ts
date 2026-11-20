import { esIsbnValido, limpiarIsbn, normalizarConsulta, primerValor } from '../parametros';

describe('primerValor', () => {
  it('toma el primero si llega un arreglo y vacío si no llega nada', () => {
    expect(primerValor(['borges', 'cortazar'])).toBe('borges');
    expect(primerValor([])).toBe('');
    expect(primerValor(undefined)).toBe('');
    expect(primerValor('rayuela')).toBe('rayuela');
  });
});

describe('normalizarConsulta', () => {
  it('recorta y colapsa espacios', () => {
    expect(normalizarConsulta('   jorge    luis   borges  ')).toBe('jorge luis borges');
  });

  it('usa el primer valor de un arreglo', () => {
    expect(normalizarConsulta([' sabato ', 'rulfo'])).toBe('sabato');
  });

  it('devuelve vacío con undefined o solo espacios', () => {
    expect(normalizarConsulta(undefined)).toBe('');
    expect(normalizarConsulta('    ')).toBe('');
  });
});

describe('limpiarIsbn', () => {
  it('saca guiones y espacios', () => {
    expect(limpiarIsbn('978-84-9908-950-8')).toBe('9788499089508');
    expect(limpiarIsbn(' 978 8420 437484 ')).toBe('9788420437484');
  });
});

describe('esIsbnValido', () => {
  it('acepta exactamente 13 dígitos', () => {
    expect(esIsbnValido('9788499089508')).toBe(true);
  });

  it('rechaza letras, largos distintos y vacío', () => {
    expect(esIsbnValido('abc')).toBe(false);
    expect(esIsbnValido('123')).toBe(false);
    expect(esIsbnValido('97884990895081')).toBe(false);
    expect(esIsbnValido('978849908950X')).toBe(false);
    expect(esIsbnValido('')).toBe(false);
  });
});
