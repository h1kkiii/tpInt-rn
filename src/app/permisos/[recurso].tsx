import { useLocalSearchParams } from 'expo-router';

import { PermisoPrevio } from '@/components/PermisoPrevio';
import { RecursoDesconocido } from '@/components/RecursoDesconocido';
import { esRecurso } from '@/lib/permisos';
import { primerValor } from '@/lib/parametros';

export default function Permiso() {
  const { recurso } = useLocalSearchParams<{ recurso: string }>();
  const valor = primerValor(recurso);
  return esRecurso(valor) ? <PermisoPrevio recurso={valor} /> : <RecursoDesconocido recurso={valor} />;
}
