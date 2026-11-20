import { PALETAS, type Esquema, type Paleta } from '../tema';

// Luminancia relativa y contraste según WCAG 2.x.
function luminancia(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((inicio) => parseInt(hex.slice(inicio, inicio + 2), 16) / 255)
    .map((canal) => (canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a: string, b: string): number {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

// [color del texto, color del fondo sobre el que aparece en la app]
const PARES: [keyof Paleta, keyof Paleta][] = [
  ['texto', 'fondo'],
  ['texto', 'superficie'],
  ['texto', 'superficieAlterna'],
  ['textoSecundario', 'fondo'],
  ['textoSecundario', 'superficie'],
  ['textoSecundario', 'superficieAlterna'],
  ['primario', 'fondo'],
  ['primario', 'superficie'],
  ['sobrePrimario', 'primario'],
  ['sobrePeligro', 'peligro'],
  ['peligro', 'fondo'],
  ['peligro', 'superficie'],
  ['textoAviso', 'fondoAviso'],
  ['exito', 'fondo'],
  ['sobreCamara', 'fondoCamara'],
];

const ESQUEMAS: Esquema[] = ['clara', 'oscura'];

describe.each(ESQUEMAS)('paleta %s', (esquema) => {
  it.each(PARES)('%s sobre %s tiene contraste de al menos 4.5:1', (texto, fondo) => {
    const paleta = PALETAS[esquema];
    expect(contraste(paleta[texto], paleta[fondo])).toBeGreaterThanOrEqual(4.5);
  });
});
