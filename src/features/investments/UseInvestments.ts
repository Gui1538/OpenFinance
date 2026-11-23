import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useSync } from '@/providers/SyncProvider';
import { goBack } from '@/utils/navigation';
import { fetchQuotes, loadCachedQuotes, type Quote, type QuotesSnapshot } from './InvestmentsAPI';

export function useInvestments() {
  const { showFeedback } = useFeedback();
  const { isOnline } = useSync();
  const [snapshot, setSnapshot] = useState<QuotesSnapshot | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedOnce = useRef(false);

  const refresh = useCallback(
    async (manual = false) => {
      setLoading(true);
      setError(null);
      try {
        const fresh = await fetchQuotes();
        setSnapshot(fresh);
        setFromCache(false);
        if (manual && fresh.failed.length) {
          showFeedback({
            type: 'info',
            title: 'Atualização parcial',
            message: `Não foi possível atualizar: ${fresh.failed.join(', ')}. Os demais ativos estão em dia.`,
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro ao buscar cotações.';
        setError(msg);
        const cached = await loadCachedQuotes();
        if (cached) {
          setSnapshot(cached);
          setFromCache(true);
        }
        if (manual) showFeedback({ type: 'error', title: 'Falha ao atualizar', message: cached ? `${msg} Exibindo a última cotação salva.` : msg });
      } finally {
        setLoading(false);
      }
    },
    [showFeedback],
  );

  useFocusEffect(
    useCallback(() => {
      if (loadedOnce.current) return;
      loadedOnce.current = true;
      void (async () => {
        const cached = await loadCachedQuotes();
        if (cached) {
          setSnapshot(cached);
          setFromCache(true);
        }
        if (isOnline) await refresh(false);
        else if (!cached) setError('Você está offline e ainda não há cotações salvas.');
      })();
    }, [isOnline, refresh]),
  );

  const byKind = useMemo(() => {
    const q = snapshot?.quotes ?? [];
    const pick = (k: Quote['kind']) => q.filter((i) => i.kind === k);
    return { currencies: pick('currency'), crypto: pick('crypto'), stocks: pick('stock') };
  }, [snapshot]);

  return {
    ...byKind,
    snapshot, fromCache, loading, error, isOnline,
    refresh: () => refresh(true),
    goBack: () => goBack('/Home'),
  };
}
