import { PermissionStatus, type PermissionResponse } from 'expo-camera';

import { esRecurso, estadoDesde } from '../permisos';

function respuesta(status: PermissionStatus, granted: boolean, canAskAgain: boolean): PermissionResponse {
  return { status, granted, canAskAgain, expires: 'never' };
}

describe('estadoDesde', () => {
  it('sin respuesta todavía está cargando', () => {
    expect(estadoDesde(null)).toBe('cargando');
  });

  it('concedido si granted', () => {
    expect(estadoDesde(respuesta(PermissionStatus.GRANTED, true, true))).toBe('concedido');
  });

  it('con el mismo status "denied" distingue preguntable de bloqueado por canAskAgain', () => {
    expect(estadoDesde(respuesta(PermissionStatus.DENIED, false, true))).toBe('preguntable');
    expect(estadoDesde(respuesta(PermissionStatus.DENIED, false, false))).toBe('bloqueado');
  });

  it('sin decidir todavía es preguntable', () => {
    expect(estadoDesde(respuesta(PermissionStatus.UNDETERMINED, false, true))).toBe('preguntable');
  });
});

describe('esRecurso', () => {
  it('solo acepta camara y notificaciones', () => {
    expect(esRecurso('camara')).toBe(true);
    expect(esRecurso('notificaciones')).toBe(true);
    expect(esRecurso('ubicacion')).toBe(false);
    expect(esRecurso(undefined)).toBe(false);
  });
});
