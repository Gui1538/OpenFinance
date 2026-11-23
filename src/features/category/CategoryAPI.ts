import { createRepository } from '@/services/repository';
import {
  CATEGORY_TYPES, NOME_CATEGORIA_MAX, type Category, type CategoryType, type Expense, type IconName,
} from '@/types';
import { checkDescricao, checkText } from '@/utils/validation';

export const categoryRepo = createRepository<Category>('categories');
const expenseRepo = createRepository<Expense>('expenses');

export interface CategoryFormData {
  nome: string;
  tipo: CategoryType | '';
  descricao: string;
  icone: IconName;
  cor: string;
}

export type CategoryErrors = Partial<Record<keyof CategoryFormData, string>>;

export function validateCategory(form: CategoryFormData, all: Category[], editingId?: string): CategoryErrors {
  const errors: CategoryErrors = {};
  const nomeErr = checkText(form.nome, NOME_CATEGORIA_MAX, 'o nome da categoria');
  if (nomeErr) errors.nome = nomeErr;
  else if (all.some((c) => c.id !== editingId && c.nome.toLowerCase() === form.nome.trim().toLowerCase())) {
    errors.nome = 'Já existe uma categoria com esse nome.';
  }
  if (!form.tipo || !(form.tipo in CATEGORY_TYPES)) errors.tipo = 'Selecione o tipo da categoria.';
  const descErr = checkDescricao(form.descricao);
  if (descErr) errors.descricao = descErr;
  return errors;
}

export async function saveCategory(uid: string, form: CategoryFormData, id?: string): Promise<Category> {
  const data = {
    nome: form.nome.trim(),
    tipo: form.tipo as CategoryType,
    descricao: form.descricao.trim(),
    icone: form.icone,
    cor: form.cor,
  };
  return id ? categoryRepo.update(uid, id, data) : categoryRepo.create(uid, data);
}

/** Regra: uma categoria que ainda tem despesas não pode ser excluída. */
export async function deleteCategory(uid: string, id: string): Promise<void> {
  const expenses = await expenseRepo.list(uid);
  const used = expenses.filter((e) => e.categoriaId === id).length;
  if (used > 0) {
    throw new Error(
      `Esta categoria está em uso por ${used} ${used === 1 ? 'despesa' : 'despesas'}. Edite ou exclua essas despesas primeiro.`,
    );
  }
  await categoryRepo.remove(uid, id);
}
