import { router, usePathname } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StatusDialog } from '@/components/ui';
import { checkOnline, watchConnectivity } from '@/services/connectivity';
import { localDB } from '@/services/database';
import { subscribeLocalChange, syncAll, type SyncResult } from '@/services/sync';
import { colors } from '@/theme';
import { useAuthUser } from './AuthProvider';

interface SyncContextValue {
  isOnline: boolean;
  syncing: boolean;
  /** quantidade de alterações salvas só no aparelho, aguardando envio */
  pending: number;
  lastSyncAt: number | null;
  lastResult: SyncResult | null;
  /** muda sempre que os dados locais mudam — use como dependência para recarregar listas */
  version: number;
  syncNow: () => Promise<SyncResult | null>;
}

const SyncContext = createContext<SyncContextValue>({
  isOnline: true,
  syncing: false,
  pending: 0,
  lastSyncAt: null,
  lastResult: null,
  version: 0,
  syncNow: async () => null,
});

export function SyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthUser();
  const uid = user?.uid ?? null;
  const pathname = usePathname();

  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pending, setPending] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);
  const [version, setVersion] = useState(0);
  const [offlineModal, setOfflineModal] = useState(false);

  const onlineRef = useRef(true);
  const uidRef = useRef<string | null>(null);
  const pathRef = useRef(pathname);
  useEffect(() => {
    uidRef.current = uid;
    pathRef.current = pathname;
  });

  const refreshPending = useCallback(async () => {
    const id = uidRef.current;
    setPending(id ? await localDB.countQueue(id) : 0);
  }, []);

  const syncNow = useCallback(async (): Promise<SyncResult | null> => {
    const id = uidRef.current;
    if (!id || !onlineRef.current) return null;
    setSyncing(true);
    try {
      const result = await syncAll(id);
      setLastResult(result);
      if (!result.error) setLastSyncAt(Date.now());
      if (result.pushed > 0 || result.pulled > 0) setVersion((v) => v + 1);
      await refreshPending();
      return result;
    } finally {
      setSyncing(false);
    }
  }, [refreshPending]);

  // Banco local + monitor de conexão
  useEffect(() => {
    let alive = true;
    localDB.init().catch(() => undefined);

    checkOnline().then((online) => {
      if (!alive) return;
      onlineRef.current = online;
      setIsOnline(online);
      if (!online) setOfflineModal(true);
    });

    const stop = watchConnectivity((online) => {
      const wasOnline = onlineRef.current;
      onlineRef.current = online;
      setIsOnline(online);
      if (!online && wasOnline) setOfflineModal(true);
      if (online && !wasOnline) {
        setOfflineModal(false);
        void (async () => {
          const before = uidRef.current ? await localDB.countQueue(uidRef.current) : 0;
          const result = await syncNow();
          // Voltou a conexão e havia dados guardados no aparelho: mostra a tela de sincronização.
          if (result && !result.error && before > 0 && pathRef.current !== '/Sync') {
            try {
              router.push('/Sync');
            } catch {
              /* navegação ainda não montada */
            }
          }
        })();
      }
    });
    return () => {
      alive = false;
      stop();
    };
  }, [syncNow]);

  // Login/logout: carrega pendências e baixa os dados da nuvem
  useEffect(() => {
    void refreshPending();
    if (uid) void syncNow();
  }, [uid, refreshPending, syncNow]);

  // Alteração local (criar/editar/excluir): atualiza listas e tenta enviar na hora
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const off = subscribeLocalChange(() => {
      setVersion((v) => v + 1);
      void refreshPending();
      if (onlineRef.current) {
        clearTimeout(timer);
        timer = setTimeout(() => void syncNow(), 300);
      }
    });
    return () => {
      off();
      clearTimeout(timer);
    };
  }, [refreshPending, syncNow]);

  const value = useMemo(
    () => ({ isOnline, syncing, pending, lastSyncAt, lastResult, version, syncNow }),
    [isOnline, syncing, pending, lastSyncAt, lastResult, version, syncNow],
  );

  return (
    <SyncContext.Provider value={value}>
      {children}
      <StatusDialog
        visible={offlineModal}
        icon="cloud-offline"
        tint={colors.danger}
        tintBg={colors.dangerLight}
        title="Modo Offline"
        message="Você está sem conexão com a internet. Os dados serão salvos localmente no SQLite e sincronizados assim que a conexão voltar."
        buttonLabel="Entendi"
        onPress={() => setOfflineModal(false)}
      />
    </SyncContext.Provider>
  );
}

export const useSync = () => useContext(SyncContext);
