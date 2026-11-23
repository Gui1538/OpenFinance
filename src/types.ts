import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export const DESCRICAO_MAX = 500;
export const NOME_CATEGORIA_MAX = 30;
export const NOME_MAX = 60;

/** Campos comuns a Categoria, Despesa e Receita. `usuarioId` é a FK para o dono do registro. */
export interface BaseRecord {
  id: string;
  usuarioId: string;
  createdAt: number;
  updatedAt: number;
}

export type CategoryType = 'essencial' | 'nao_essencial';
export type ExpenseType = 'fixa' | 'variavel';
export type RevenueType = 'salario' | 'venda' | 'presente' | 'investimento' | 'outros';

export interface Category extends BaseRecord {
  nome: string;
  tipo: CategoryType;
  descricao: string;
  icone: IconName;
  cor: string;
}

/** Regra de negócio: toda despesa pertence a exatamente uma categoria (`categoriaId` obrigatório). */
export interface Expense extends BaseRecord {
  categoriaId: string;
  nome: string;
  tipo: ExpenseType;
  descricao: string;
  valor: number;
  /** YYYY-MM-DD */
  data: string;
}

export interface Revenue extends BaseRecord {
  nome: string;
  tipo: RevenueType;
  descricao: string;
  valor: number;
  /** YYYY-MM-DD */
  data: string;
}

/** Documento `users/{id}`. A senha NÃO é guardada aqui: fica só no Firebase Auth (hash). */
export interface UserProfile {
  id: string;
  nome: string;
  /** YYYY-MM-DD */
  dataNascimento: string;
  email: string;
  telefone: string;
  cpf: string;
  cep: string;
  provider: 'password' | 'google';
  createdAt: number;
  updatedAt: number;
}

export type CollectionName = 'categories' | 'expenses' | 'revenues';

export const CATEGORY_TYPES: Record<CategoryType, { label: string; hint: string }> = {
  essencial: { label: 'Essencial', hint: 'Necessidades do dia a dia' },
  nao_essencial: { label: 'Não essencial', hint: 'Desejos e supérfluos' },
};

export const EXPENSE_TYPES: Record<ExpenseType, { label: string; hint: string }> = {
  fixa: { label: 'Fixa', hint: 'Repete todo mês (aluguel, internet...)' },
  variavel: { label: 'Variável', hint: 'Muda de valor ou acontece de vez em quando' },
};

export const REVENUE_TYPES: Record<RevenueType, { label: string; icon: IconName; color: string }> = {
  salario: { label: 'Salário', icon: 'briefcase', color: '#2F6FED' },
  venda: { label: 'Venda', icon: 'trophy', color: '#F5B301' },
  presente: { label: 'Presente', icon: 'gift', color: '#F59E0B' },
  investimento: { label: 'Investimento', icon: 'trending-up', color: '#0F7B3A' },
  outros: { label: 'Outros', icon: 'cash', color: '#6B7280' },
};

export const CATEGORY_ICONS: IconName[] = [
  'restaurant', 'car', 'home', 'heart', 'game-controller', 'school',
  'cart', 'medkit', 'airplane', 'shirt', 'paw', 'fitness',
  'gift', 'wifi', 'phone-portrait', 'cafe',
];

export const CATEGORY_COLORS = [
  '#F4623A', '#F5B301', '#8B5CF6', '#EC4899', '#2F6FED', '#0EA5E9', '#0F7B3A', '#6B7280',
];

/** Categorias criadas automaticamente quando o usuário se cadastra. */
export const DEFAULT_CATEGORIES: {
  key: string; nome: string; tipo: CategoryType; descricao: string; icone: IconName; cor: string;
}[] = [
  { key: 'alimentacao', nome: 'Alimentação', tipo: 'essencial', descricao: 'Mercado, restaurantes, lanches e delivery.', icone: 'restaurant', cor: '#F4623A' },
  { key: 'transporte', nome: 'Transporte', tipo: 'essencial', descricao: 'Combustível, transporte público, aplicativos e manutenção do veículo.', icone: 'car', cor: '#F5B301' },
  { key: 'moradia', nome: 'Moradia', tipo: 'essencial', descricao: 'Aluguel ou financiamento, condomínio, água, luz e internet.', icone: 'home', cor: '#8B5CF6' },
  { key: 'saude', nome: 'Saúde', tipo: 'essencial', descricao: 'Plano de saúde, consultas, exames e farmácia.', icone: 'heart', cor: '#EC4899' },
  { key: 'lazer', nome: 'Lazer', tipo: 'nao_essencial', descricao: 'Cinema, viagens, jogos, streaming e passeios.', icone: 'game-controller', cor: '#2F6FED' },
  { key: 'educacao', nome: 'Educação', tipo: 'essencial', descricao: 'Cursos, mensalidades, livros e material escolar.', icone: 'school', cor: '#0EA5E9' },
];
