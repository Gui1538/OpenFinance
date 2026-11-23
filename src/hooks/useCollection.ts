import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useUid } from '@/providers/AuthProvider';
import { useSync } from '@/providers/SyncProvider';
import type { createRepository } from '@/services/repository';
import type { BaseRecord } from '@/types';

type Repository<T extends BaseRecord> = ReturnType<typeof createRepository<T>>;

/** Lista os registros do usuário a partir do SQLite e recarrega ao focar a tela ou quando o sync muda os dados. */
export function useCollection<T extends BaseRecord>(repo: Repository<T>) {
  const uid = useUid();
  const { version } = useSync();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!uid) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      setItems(await repo.list(uid));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, [uid, repo]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load, version]),
  );

  return { items, loading, error, reload: load };
}
