import { useLocalSearchParams } from 'expo-router';
import { CategoryForm } from '@/features/category/CrudCategory';

/** Sem parâmetro = novo registro; com ?id=... = edição. */
export default function CategoryFormRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <CategoryForm key={id ?? 'new'} id={id} />;
}
