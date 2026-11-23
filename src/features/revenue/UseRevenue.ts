import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useCollection } from '@/hooks/useCollection';
import { useUid } from '@/providers/AuthProvider';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useSync } from '@/providers/SyncProvider';
import type { Revenue, RevenueType } from '@/types';
import { amountToInput, isoToBR, todayISO } from '@/utils/format';
import { goBack } from '@/utils/navigation';
import { deleteRevenue, revenueRepo, saveRevenue, validateRevenue, type RevenueErrors, type RevenueFormData } from './RevenueAPI';

const withOfflineNote = (online: boolean, text: string) =>
  online ? text : `${text} Você está offline: ficou salvo no aparelho e será enviado quando a conexão voltar.`;

export function useRevenues() {
  const uid = useUid();
  const { showFeedback } = useFeedback();
  const { isOnline } = useSync();
  const { items, loading, reload } = useCollection(revenueRepo);
  const [toDelete, setToDelete] = useState<Revenue | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sorted = useMemo(() => [...items].sort((a, b) => b.data.localeCompare(a.data) || b.createdAt - a.createdAt), [items]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteRevenue(uid, toDelete.id);
      setToDelete(null);
      showFeedback({ type: 'success', title: 'Receita excluída', message: withOfflineNote(isOnline, 'A receita foi removida com sucesso.') });
    } catch (e) {
      setToDelete(null);
      showFeedback({ type: 'error', title: 'Não foi possível excluir', message: e instanceof Error ? e.message : 'Erro inesperado.' });
    } finally {
      setDeleting(false);
    }
  };

  return {
    items: sorted, loading, reload,
    toDelete, deleting, askDelete: setToDelete, cancelDelete: () => setToDelete(null), confirmDelete,
    goAdd: () => router.push('/RevenueForm'),
    goEdit: (id: string) => router.push({ pathname: '/RevenueForm', params: { id } }),
    goBack: () => goBack('/Home'),
  };
}

export function useRevenueForm(id?: string) {
  const uid = useUid();
  const { showFeedback } = useFeedback();
  const { isOnline } = useSync();

  const [form, setForm] = useState<RevenueFormData>({
    nome: '', valor: '', tipo: '', data: isoToBR(todayISO()), descricao: '',
  });
  const [errors, setErrors] = useState<RevenueErrors>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!id);

  useEffect(() => {
    if (!id || !uid) return;
    revenueRepo.get(uid, id).then((r) => {
      if (r) setForm({ nome: r.nome, valor: amountToInput(r.valor), tipo: r.tipo, data: isoToBR(r.data), descricao: r.descricao });
      setLoaded(true);
    });
  }, [id, uid]);

  const setField = <K extends keyof RevenueFormData>(key: K) => (value: RevenueFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async () => {
    const found = validateRevenue(form);
    setErrors(found);
    if (Object.keys(found).length) {
      showFeedback({ type: 'error', title: 'Verifique os campos', message: Object.values(found)[0]! });
      return;
    }
    setSaving(true);
    try {
      await saveRevenue(uid, form, id);
      showFeedback({
        type: 'success',
        title: id ? 'Receita atualizada!' : 'Receita cadastrada!',
        message: withOfflineNote(isOnline, id ? 'As alterações foram salvas com sucesso.' : 'Sua receita foi cadastrada com sucesso.'),
        onClose: () => goBack('/Revenue'),
      });
    } catch (e) {
      showFeedback({ type: 'error', title: 'Erro ao salvar receita', message: e instanceof Error ? e.message : 'Não foi possível salvar. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  return { isEditing: !!id, loaded, saving, form, errors, setField, submit, setTipo: (v: string) => setField('tipo')(v as RevenueType), goBack: () => goBack('/Revenue') };
}
