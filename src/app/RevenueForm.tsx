import { useLocalSearchParams } from 'expo-router';
import { RevenueForm } from '@/features/revenue/CrudRevenue';

/** Sem parâmetro = novo registro; com ?id=... = edição. */
export default function RevenueFormRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <RevenueForm key={id ?? 'new'} id={id} />;
}
