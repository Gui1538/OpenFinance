import { localDB } from '@/services/database';
import type { Category, Expense, Revenue } from '@/types';
import { REVENUE_TYPES } from '@/types';
import { isCurrentMonth } from '@/utils/format';

export interface Movement {
  id: string;
  kind: 'revenue' | 'expense';
  title: string;
  amount: number;
  date: string;
  createdAt: number;
}

export interface HomeSummary {
  balance: number;
  totalRevenue: number;
  totalExpense: number;
  monthRevenue: number;
  monthExpense: number;
  recent: Movement[];
}

export const EMPTY_SUMMARY: HomeSummary = {
  balance: 0, totalRevenue: 0, totalExpense: 0, monthRevenue: 0, monthExpense: 0, recent: [],
};

const sum = (list: { valor: number }[]) => list.reduce((acc, i) => acc + i.valor, 0);

export async function loadHomeSummary(uid: string): Promise<HomeSummary> {
  const [expenses, revenues, categories] = await Promise.all([
    localDB.list<Expense>('expenses', uid),
    localDB.list<Revenue>('revenues', uid),
    localDB.list<Category>('categories', uid),
  ]);
  const catName = new Map(categories.map((c) => [c.id, c.nome]));

  const movements: Movement[] = [
    ...revenues.map<Movement>((r) => ({
      id: r.id, kind: 'revenue', title: r.nome || REVENUE_TYPES[r.tipo]?.label || 'Receita',
      amount: r.valor, date: r.data, createdAt: r.createdAt,
    })),
    ...expenses.map<Movement>((e) => ({
      id: e.id, kind: 'expense', title: e.nome || catName.get(e.categoriaId) || 'Despesa',
      amount: e.valor, date: e.data, createdAt: e.createdAt,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  const totalRevenue = sum(revenues);
  const totalExpense = sum(expenses);
  return {
    balance: totalRevenue - totalExpense,
    totalRevenue,
    totalExpense,
    monthRevenue: sum(revenues.filter((r) => isCurrentMonth(r.data))),
    monthExpense: sum(expenses.filter((e) => isCurrentMonth(e.data))),
    recent: movements.slice(0, 5),
  };
}
