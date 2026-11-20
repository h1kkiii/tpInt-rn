import { FilaEspera } from '@/components/FilaEspera';
import { FilaPrestamo } from '@/components/FilaPrestamo';
import { TarjetaAviso } from '@/components/TarjetaAviso';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import type { Recordatorios } from '@/hooks/useRecordatorios';
import type { ItemReservas as Item } from '@/types/biblioteca';

type Props = {
  item: Item;
  recordatorios: Recordatorios;
};

export function ItemReservas({ item, recordatorios }: Props) {
  const { descartarAviso } = useBiblioteca();
  switch (item.tipo) {
    case 'aviso':
      return <TarjetaAviso aviso={item.aviso} onDescartar={descartarAviso} />;
    case 'prestamo':
      return (
        <FilaPrestamo
          prestamo={item.prestamo}
          recordatorio={recordatorios.estadoDe(item.prestamo)}
          onAlternarRecordatorio={recordatorios.alternar}
          onDevolver={recordatorios.devolver}
        />
      );
    case 'espera':
      return <FilaEspera espera={item.espera} />;
  }
}
