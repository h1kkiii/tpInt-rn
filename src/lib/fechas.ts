const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export function sumarDias(fecha: Date, dias: number): Date {
  const resultado = new Date(fecha.getTime());
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

// Sin Intl: en Hermes/Android el soporte de locales varía según el dispositivo,
// y así el resultado es el mismo en todos lados (y se puede testear).
export function formatearFecha(fecha: Date): string {
  return `${DIAS[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
}

type MomentoRecordatorio = { tipo: 'segundos'; segundos: number } | { tipo: 'fecha'; fecha: Date };

// Cuándo llega el recordatorio: en modo demostración, a los pocos segundos;
// si no, un día antes de la devolución. Si ese día ya pasó, en la demora corta.
export function momentoRecordatorio(
  vence: Date,
  ahora: Date,
  modoDemostracion: boolean,
  segundosDemostracion: number,
): MomentoRecordatorio {
  if (modoDemostracion) return { tipo: 'segundos', segundos: segundosDemostracion };
  const fecha = sumarDias(vence, -1);
  if (fecha.getTime() <= ahora.getTime()) return { tipo: 'segundos', segundos: segundosDemostracion };
  return { tipo: 'fecha', fecha };
}
