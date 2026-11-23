import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { categoryRepo } from '@/features/category/CategoryAPI';
import { useCollection } from '@/hooks/useCollection';
import { useUid } from '@/providers/AuthProvider';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useSync } from '@/providers/SyncProvider';
import type { Expense, ExpenseType } from '@/types';
import { amountToInput, isoToBR, todayISO } from '@/utils/format';
import { goBack } from '@/utils/navigation';
import { deleteExpense, expenseRepo, saveExpense, validateExpense, type ExpenseErrors, type ExpenseFormData } from './ExpensesAPI';

const withOfflineNote = (online: boolean, text: string) =>
  online ? text : `${text} Você está offline: ficou salvo no aparelho e será enviado quando a conexão voltar.`;

export function useExpenses() {
  const uid = useUid();
  const { showFeedback } = useFeedback();
  const { isOnline } = useSync();
  const { items, loading, reload } = useCollection(expenseRepo);
  const { items: categories } = useCollection(categoryRepo);
  const [toDelete, setToDelete] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const sorted = useMemo(() => [...items].sort((a, b) => b.data.localeCompare(a.data) || b.createdAt - a.createdAt), [items]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteExpense(uid, toDelete.id);
      setToDelete(null);
      showFeedback({ type: 'success', title: 'Despesa excluída', message: withOfflineNote(isOnline, 'A despesa foi removida com sucesso.') });
    } catch (e) {
      setToDelete(null);
      showFeedback({ type: 'error', title: 'Não foi possível excluir', message: e instanceof Error ? e.message : 'Erro inesperado.' });
    } finally {
      setDeleting(false);
    }
  };

  return {
    items: sorted, categoryById, loading, reload,
    toDelete, deleting, askDelete: setToDelete, cancelDelete: () => setToDelete(null), confirmDelete,
    goAdd: () => router.push('/ExpenseForm'),
    goEdit: (id: string) => router.push({ pathname: '/ExpenseForm', params: { id } }),
    goBack: () => goBack('/Home'),
  };
}

export function useExpenseForm(id?: string) {
  const uid = useUid();
  const { showFeedback } = useFeedback();
  const { isOnline } = useSync();
  const { items: categories } = useCollection(categoryRepo);

  const [form, setForm] = useState<ExpenseFormData>({
    nome: '', valor: '', categoriaId: '', tipo: '', data: isoToBR(todayISO()), descricao: '',
  });
  const [errors, setErrors] = useState<ExpenseErrors>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!id);

  useEffect(() => {
    if (!id || !uid) return;
    expenseRepo.get(uid, id).then((e) => {
      if (e) {
        setForm({
          nome: e.nome, valor: amountToInput(e.valor), categoriaId: e.categoriaId,
          tipo: e.tipo, data: isoToBR(e.data), descricao: e.descricao,
        });
      }
      setLoaded(true);
    });
  }, [id, uid]);

  const setField = <K extends keyof ExpenseFormData>(key: K) => (value: ExpenseFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async () => {
    const found = validateExpense(form, categories.map((c) => c.id));
    setErrors(found);
    if (Object.keys(found).length) {
      showFeedback({ type: 'error', title: 'Verifique os campos', message: Object.values(found)[0]! });
      return;
    }
    setSaving(true);
    try {
      await saveExpense(uid, form, id);
      showFeedback({
        type: 'success',
        title: id ? 'Despesa atualizada!' : 'Despesa cadastrada!',
        message: withOfflineNote(isOnline, id ? 'As alterações foram salvas com sucesso.' : 'Sua despesa foi cadastrada com sucesso.'),
        onClose: () => goBack('/Expenses'),
      });
    } catch (e) {
      showFeedback({ type: 'error', title: 'Erro ao salvar despesa', message: e instanceof Error ? e.message : 'Não foi possível salvar. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  return {
    isEditing: !!id, loaded, saving, form, errors, categories, setField, submit,
    setTipo: (v: string) => setField('tipo')(v as ExpenseType),
    goBack: () => goBack('/Expenses'),
    goNewCategory: () => router.push('/CategoryForm'),
  };
}
