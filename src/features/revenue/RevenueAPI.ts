import { createRepository } from '@/services/repository';
import { NOME_MAX, REVENUE_TYPES, type Revenue, type RevenueType } from '@/types';
import { brToISO, parseAmount } from '@/utils/format';
import { checkDescricao, checkText } from '@/utils/validation';

export const revenueRepo = createRepository<Revenue>('revenues');

export interface RevenueFormData {
  nome: string;
  valor: string;
  tipo: RevenueType | '';
  /** dd/mm/aaaa */
  data: string;
  descricao: string;
}

export type RevenueErrors = Partial<Record<keyof RevenueFormData, string>>;

export function validateRevenue(f: RevenueFormData): RevenueErrors {
  const e: RevenueErrors = {};
  const nomeErr = checkText(f.nome, NOME_MAX, 'o nome da receita');
  if (nomeErr) e.nome = nomeErr;
  if (parseAmount(f.valor) === null) e.valor = 'Informe um valor maior que zero (ex: 2.500,00).';
  if (!f.tipo || !(f.tipo in REVENUE_TYPES)) e.tipo = 'Selecione o tipo da receita.';
  if (brToISO(f.data) === null) e.data = 'Data inválida (use dd/mm/aaaa).';
  const descErr = checkDescricao(f.descricao);
  if (descErr) e.descricao = descErr;
  return e;
}

export async function saveRevenue(uid: string, f: RevenueFormData, id?: string): Promise<Revenue> {
  const data = {
    nome: f.nome.trim(),
    tipo: f.tipo as RevenueType,
    descricao: f.descricao.trim(),
    valor: parseAmount(f.valor)!,
    data: brToISO(f.data)!,
  };
  return id ? revenueRepo.update(uid, id, data) : revenueRepo.create(uid, data);
}

export const deleteRevenue = (uid: string, id: string) => revenueRepo.remove(uid, id);
