import { colaDesde, pilaDesde } from '../copiaAlEscribir';
import { deserializar, reconciliar, serializar, VERSION_GUARDADO } from '../persistencia';
import type { EstadoBiblioteca, LibroReciente } from '@/types/biblioteca';

function estadoDePrueba(): EstadoBiblioteca {
  return {
    prestamos: [
      {
        isbn: '9788499089508',
        titulo: 'Ficciones',
        vence: '2026-11-27T13:00:00.000Z',
        recordatorio: true,
        notificacionId: 'noti-1',
      },
    ],
    esperas: { '9789500401036': colaDesde(['Lucía', 'Tomás', 'Yo']) },
    recientes: pilaDesde<LibroReciente>([
      { isbn: '9788420437484', titulo: 'Rayuela', autor: 'Julio Cortázar' },
      { isbn: '9788499089508', titulo: 'Ficciones', autor: 'Jorge Luis Borges' },
    ]),
    titulos: { '9789500401036': 'Sobre héroes y tumbas' },
    avisos: [{ id: 'a1', texto: 'Ya podés retirar "Rayuela"' }],
  };
}

describe('serializar y deserializar', () => {
  it('un estado válido vuelve igual, con Colas y Pila reconstruidas', () => {
    const vuelta = deserializar(serializar(estadoDePrueba()));
    expect(vuelta).not.toBeNull();
    expect(vuelta?.prestamos).toEqual(estadoDePrueba().prestamos);
    expect(vuelta?.esperas['9789500401036'].aArray()).toEqual(['Lucía', 'Tomás', 'Yo']);
    expect(vuelta?.esperas['9789500401036'].frente()).toBe('Lucía');
    expect(vuelta?.recientes.tope()?.titulo).toBe('Ficciones');
    expect(vuelta?.titulos).toEqual({ '9789500401036': 'Sobre héroes y tumbas' });
    expect(vuelta?.avisos).toHaveLength(1);
  });

  it('no guarda la sesión del personal', () => {
    expect(serializar(estadoDePrueba())).not.toContain('sesion');
  });

  it('vacío o sin nada guardado devuelve null', () => {
    expect(deserializar(null)).toBeNull();
    expect(deserializar('')).toBeNull();
  });

  it('corrupto devuelve null', () => {
    expect(deserializar('{no es json')).toBeNull();
    expect(deserializar('[]')).toBeNull();
    const roto = JSON.parse(serializar(estadoDePrueba()));
    roto.prestamos[0].vence = 'mañana';
    expect(deserializar(JSON.stringify(roto))).toBeNull();
    roto.prestamos = 'muchos';
    expect(deserializar(JSON.stringify(roto))).toBeNull();
  });

  it('otra versión devuelve null', () => {
    const viejo = JSON.parse(serializar(estadoDePrueba()));
    viejo.version = VERSION_GUARDADO + 1;
    expect(deserializar(JSON.stringify(viejo))).toBeNull();
    delete viejo.version;
    expect(deserializar(JSON.stringify(viejo))).toBeNull();
  });
});

describe('reconciliar', () => {
  it('limpia flag e id de las notificaciones que ya no están programadas', () => {
    const estado = reconciliar(estadoDePrueba(), new Set());
    expect(estado.prestamos[0]).toMatchObject({ recordatorio: false, notificacionId: null });
  });

  it('si la notificación sigue programada, no cambia nada', () => {
    const original = estadoDePrueba();
    expect(reconciliar(original, new Set(['noti-1']))).toBe(original);
  });
});
