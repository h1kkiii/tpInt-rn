import { AvisoEnLinea } from '@/components/AvisoEnLinea';
import { CamaraPreguntable } from '@/components/CamaraPreguntable';
import { CampoIsbn } from '@/components/CampoIsbn';
import { Cargando } from '@/components/Cargando';
import { FormularioConTeclado } from '@/components/FormularioConTeclado';
import { MensajeError } from '@/components/MensajeError';
import { PantallaBloqueado } from '@/components/PantallaBloqueado';
import { VisorCamara } from '@/components/VisorCamara';
import { MENSAJES } from '@/constants/mensajes';
import { useLecturaIsbn } from '@/hooks/useLecturaIsbn';
import { useLibros } from '@/hooks/useLibros';
import { usePermiso } from '@/hooks/usePermiso';

export function Escaner() {
  const permiso = usePermiso('camara');
  const { libros, cargando, error, reintentar } = useLibros();
  const catalogoListo = !cargando && !error;
  const { aviso, alLeer, ingresarAMano } = useLecturaIsbn(libros, catalogoListo);

  return (
    <FormularioConTeclado>
      {/* El ISBN a mano va primero: está visible en los cuatro estados y el teclado no lo tapa. */}
      <CampoIsbn onIngresar={ingresarAMano} />

      {cargando && <Cargando texto={MENSAJES.cargandoCatalogoEscaner} />}
      {error && <MensajeError texto={MENSAJES.errorCatalogo} accion="Reintentar" onAccion={reintentar} />}
      {aviso && <AvisoEnLinea texto={aviso} />}

      {permiso.estado === 'cargando' && <Cargando texto={MENSAJES.revisandoCamara} />}
      {permiso.estado === 'preguntable' && <CamaraPreguntable />}
      {permiso.estado === 'bloqueado' && <PantallaBloqueado recurso="camara" onAbrirAjustes={permiso.abrirAjustes} />}
      {permiso.estado === 'concedido' && <VisorCamara onLeer={catalogoListo ? alLeer : undefined} />}
    </FormularioConTeclado>
  );
}
