import { createRepository } from '@/services/repository';
import { EXPENSE_TYPES, NOME_MAX, type Expense, type ExpenseType } from '@/types';
import { brToISO, parseAmount } from '@/utils/format';
import { checkDescricao, checkText } from '@/utils/validation';

export const expenseRepo = createRepository<Expense>('expenses');

export interface ExpenseFormData {
  nome: string;
  /** texto digitado, ex.: "1.250,00" */
  valor: string;
  categoriaId: string;
  tipo: ExpenseType | '';
  /** dd/mm/aaaa */
  data: string;
  descricao: string;
}

export type ExpenseErrors = Partial<Record<keyof ExpenseFormData, string>>;

export function validateExpense(f: ExpenseFormData, validCategoryIds: string[]): ExpenseErrors {
  const e: ExpenseErrors = {};
  const nomeErr = checkText(f.nome, NOME_MAX, 'o nome da despesa');
  if (nomeErr) e.nome = nomeErr;
  if (parseAmount(f.valor) === null) e.valor = 'Informe um valor maior que zero (ex: 150,00).';
  // Regra de negócio: toda despesa precisa de uma categoria existente.
  if (!f.categoriaId) e.categoriaId = 'Toda despesa precisa de uma categoria. Selecione uma.';
  else if (!validCategoryIds.includes(f.categoriaId)) e.categoriaId = 'Categoria inválida.';
  if (!f.tipo || !(f.tipo in EXPENSE_TYPES)) e.tipo = 'Selecione o tipo da despesa.';
  if (brToISO(f.data) === null) e.data = 'Data inválida (use dd/mm/aaaa).';
  const descErr = checkDescricao(f.descricao);
  if (descErr) e.descricao = descErr;
  return e;
}

export async function saveExpense(uid: string, f: ExpenseFormData, id?: string): Promise<Expense> {
  const data = {
    nome: f.nome.trim(),
    tipo: f.tipo as ExpenseType,
    descricao: f.descricao.trim(),
    valor: parseAmount(f.valor)!,
    categoriaId: f.categoriaId,
    data: brToISO(f.data)!,
  };
  return id ? expenseRepo.update(uid, id, data) : expenseRepo.create(uid, data);
}

export const deleteExpense = (uid: string, id: string) => expenseRepo.remove(uid, id);
