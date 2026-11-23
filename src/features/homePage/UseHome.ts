import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { logout } from '@/features/auth/AuthAPI';
import { useAuthUser } from '@/providers/AuthProvider';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useSync } from '@/providers/SyncProvider';
import { EMPTY_SUMMARY, loadHomeSummary, type HomeSummary } from './HomeAPI';

export function useHome() {
  const { user } = useAuthUser();
  const { showFeedback } = useFeedback();
  const { version, isOnline, pending, syncing } = useSync();
  const [summary, setSummary] = useState<HomeSummary>(EMPTY_SUMMARY);
  const [hideBalance, setHideBalance] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      loadHomeSummary(user.uid)
        .then(setSummary)
        .catch((e) =>
          showFeedback({ type: 'error', title: 'Erro ao carregar', message: e instanceof Error ? e.message : 'Não foi possível ler seus dados.' }),
        );
    }, [user, version, showFeedback]),
  );

  const firstName = (user?.displayName || user?.email?.split('@')[0] || 'Usuário').split(' ')[0];

  const signOut = async () => {
    try {
      await logout(); // o guard de rotas leva de volta à tela inicial
    } catch (e) {
      showFeedback({ type: 'error', title: 'Não foi possível sair', message: e instanceof Error ? e.message : 'Tente novamente.' });
    }
  };

  const total = summary.monthRevenue + summary.monthExpense;
  const revenuePct = total > 0 ? Math.round((summary.monthRevenue / total) * 100) : 0;

  return {
    firstName, summary, hideBalance,
    toggleBalance: () => setHideBalance((v) => !v),
    revenuePct, expensePct: total > 0 ? 100 - revenuePct : 0, hasMonthData: total > 0,
    isOnline, pending, syncing,
    signOut,
    goSync: () => router.push('/Sync'),
    goMovements: () => router.navigate('/Expenses'),
    goInvestments: () => router.navigate('/Investimentos'),
  };
}
