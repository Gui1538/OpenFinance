import { useEffect } from 'react';
import { useSync } from '@/providers/SyncProvider';
import { goBack } from '@/utils/navigation';

export type SyncStatus = 'syncing' | 'synced' | 'pending-offline' | 'error';

export function useSyncScreen() {
  const s = useSync();

  // Ao abrir a tela, tenta sincronizar (se estiver online).
  useEffect(() => {
    void s.syncNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let status: SyncStatus = 'synced';
  if (s.syncing) status = 'syncing';
  else if (!s.isOnline) status = 'pending-offline';
  else if (s.lastResult?.error || s.pending > 0) status = 'error';

  return {
    status,
    pending: s.pending,
    lastSyncAt: s.lastSyncAt,
    errorMessage: s.lastResult?.error,
    retry: () => void s.syncNow(),
    goBack: () => goBack('/Home'),
  };
}
