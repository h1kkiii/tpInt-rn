import { FilaEspera } from '@/components/FilaEspera';
import { FilaPrestamo } from '@/components/FilaPrestamo';
import { TarjetaAviso } from '@/components/TarjetaAviso';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import type { ItemReservas as Item } from '@/types/biblioteca';

type Props = {
  item: Item;
};

export function ItemReservas({ item }: Props) {
  const { devolver, descartarAviso } = useBiblioteca();
  switch (item.tipo) {
    case 'aviso':
      return <TarjetaAviso aviso={item.aviso} onDescartar={descartarAviso} />;
    case 'prestamo':
      return <FilaPrestamo prestamo={item.prestamo} onDevolver={devolver} />;
    case 'espera':
      return <FilaEspera espera={item.espera} />;
  }
}
