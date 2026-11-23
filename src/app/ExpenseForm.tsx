import { useLocalSearchParams } from 'expo-router';
import { ExpenseForm } from '@/features/expenses/CrudExpenses';

/** Sem parâmetro = novo registro; com ?id=... = edição. */
export default function ExpenseFormRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <ExpenseForm key={id ?? 'new'} id={id} />;
}
