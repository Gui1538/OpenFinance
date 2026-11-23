import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useCollection } from '@/hooks/useCollection';
import { useUid } from '@/providers/AuthProvider';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useSync } from '@/providers/SyncProvider';
import { CATEGORY_COLORS, CATEGORY_ICONS, type Category, type CategoryType } from '@/types';
import { goBack } from '@/utils/navigation';
import {
  categoryRepo, deleteCategory, saveCategory, validateCategory, type CategoryErrors, type CategoryFormData,
} from './CategoryAPI';

const savedMessage = (online: boolean, text: string) =>
  online ? text : `${text} Você está offline: ficou salvo no aparelho e será enviado quando a conexão voltar.`;

export function useCategories() {
  const uid = useUid();
  const { showFeedback } = useFeedback();
  const { isOnline } = useSync();
  const { items, loading, error, reload } = useCollection(categoryRepo);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteCategory(uid, toDelete.id);
      setToDelete(null);
      showFeedback({
        type: 'success',
        title: 'Categoria excluída',
        message: savedMessage(isOnline, `A categoria "${toDelete.nome}" foi removida.`),
      });
    } catch (e) {
      setToDelete(null);
      showFeedback({
        type: 'error',
        title: 'Não foi possível excluir',
        message: e instanceof Error ? e.message : 'Erro inesperado.',
      });
    } finally {
      setDeleting(false);
    }
  };

  return {
    items, loading, error, reload,
    toDelete, deleting,
    askDelete: setToDelete,
    cancelDelete: () => setToDelete(null),
    confirmDelete,
    goAdd: () => router.push('/CategoryForm'),
    goEdit: (id: string) => router.push({ pathname: '/CategoryForm', params: { id } }),
    goBack: () => goBack('/Home'),
  };
}

export function useCategoryForm(id?: string) {
  const uid = useUid();
  const { showFeedback } = useFeedback();
  const { isOnline } = useSync();
  const { items } = useCollection(categoryRepo);

  const [form, setForm] = useState<CategoryFormData>({
    nome: '', tipo: '', descricao: '', icone: CATEGORY_ICONS[0], cor: CATEGORY_COLORS[0],
  });
  const [errors, setErrors] = useState<CategoryErrors>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!id);

  useEffect(() => {
    if (!id || !uid) return;
    categoryRepo.get(uid, id).then((c) => {
      if (c) setForm({ nome: c.nome, tipo: c.tipo, descricao: c.descricao, icone: c.icone, cor: c.cor });
      setLoaded(true);
    });
  }, [id, uid]);

  const setField = <K extends keyof CategoryFormData>(key: K) => (value: CategoryFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async () => {
    const found = validateCategory(form, items, id);
    setErrors(found);
    if (Object.keys(found).length) {
      showFeedback({ type: 'error', title: 'Verifique os campos', message: Object.values(found)[0]! });
      return;
    }
    setSaving(true);
    try {
      await saveCategory(uid, form, id);
      showFeedback({
        type: 'success',
        title: id ? 'Categoria atualizada!' : 'Categoria cadastrada!',
        message: savedMessage(isOnline, id ? 'As alterações foram salvas com sucesso.' : 'Sua categoria foi cadastrada com sucesso.'),
        onClose: () => goBack('/Category'),
      });
    } catch (e) {
      showFeedback({
        type: 'error',
        title: 'Erro ao salvar categoria',
        message: e instanceof Error ? e.message : 'Não foi possível salvar. Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    isEditing: !!id, loaded, saving, errors, form, setField, submit,
    setTipo: (v: string) => setField('tipo')(v as CategoryType),
    goBack: () => goBack('/Category'),
  };
}
