import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { TAMANIO_ICONO } from '@/constants/tema';
import { useTema } from '@/hooks/useTema';

type NombreIonicon = ComponentProps<typeof Ionicons>['name'];

type Props = {
  activo: NombreIonicon;
  inactivo: NombreIonicon;
  enfocado: boolean;
};

// El color que manda la tab es un ColorValue (puede no ser un string):
// se toma el del tema para que el ícono siempre tenga un color válido.
export function IconoTab({ activo, inactivo, enfocado }: Props) {
  const paleta = useTema();
  return (
    <Ionicons
      name={enfocado ? activo : inactivo}
      size={TAMANIO_ICONO.normal}
      color={enfocado ? paleta.primario : paleta.textoSecundario}
    />
  );
}
