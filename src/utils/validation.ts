import { DESCRICAO_MAX } from '@/types';

/** Texto obrigatório com limite de tamanho. Retorna a mensagem de erro ou undefined. */
export function checkText(value: string, max: number, label: string): string | undefined {
  const v = value.trim();
  if (!v) return `Informe ${label}.`;
  if (v.length > max) return `${label[0].toUpperCase()}${label.slice(1)}: use no máximo ${max} caracteres.`;
  return undefined;
}

export const checkDescricao = (value: string) => checkText(value, DESCRICAO_MAX, 'a descrição');

export const MIN_AGE = 18;

/** Idade completa em anos a partir de "YYYY-MM-DD". */
export function ageFromISO(iso: string, now = new Date()): number {
  const [y, m, d] = iso.split('-').map(Number);
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
  return age;
}
