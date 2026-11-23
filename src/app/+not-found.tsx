import { useAuthUser } from '@/providers/AuthProvider';
import { Redirect } from 'expo-router';

/** Qualquer rota inexistente leva para o lugar certo em vez de mostrar "Unmatched Route". */
export default function NotFound() {
  const { user, loading } = useAuthUser();
  if (loading) return null;
  return <Redirect href={user ? '/Home' : '/'} />;
}
