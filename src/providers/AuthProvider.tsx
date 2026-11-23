import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { auth } from '@/services/firebase';

interface AuthContextValue {
  user: User | null;
  /** true enquanto o Firebase ainda está restaurando a sessão salva */
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthUser = () => useContext(AuthContext);

/** Atalho: uid do usuário logado (só use dentro de telas protegidas). */
export function useUid(): string {
  const { user } = useAuthUser();
  return user?.uid ?? '';
}
