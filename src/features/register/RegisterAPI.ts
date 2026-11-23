import { createUserWithEmailAndPassword, deleteUser, updateProfile } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { saveUserProfile, seedDefaultCategories } from '@/services/userProfile';
import { brToISO, isValidCPF, isValidEmail } from '@/utils/format';
import { ageFromISO, MIN_AGE } from '@/utils/validation';

export interface RegisterData {
  nome: string;
  /** dd/mm/aaaa */
  dataNascimento: string;
  email: string;
  telefone: string;
  cpf: string;
  cep: string;
  senha: string;
  confirmarSenha: string;
}

export type RegisterErrors = Partial<Record<keyof RegisterData, string>>;

export const EMPTY_REGISTER: RegisterData = {
  nome: '', dataNascimento: '', email: '', telefone: '', cpf: '', cep: '', senha: '', confirmarSenha: '',
};

export function validateRegister(d: RegisterData): RegisterErrors {
  const e: RegisterErrors = {};
  if (d.nome.trim().split(/\s+/).filter(Boolean).length < 2) e.nome = 'Informe nome e sobrenome.';
  const nasc = brToISO(d.dataNascimento);
  if (!nasc) e.dataNascimento = 'Data de nascimento inválida (dd/mm/aaaa).';
  else if (ageFromISO(nasc) < 0) e.dataNascimento = 'A data de nascimento não pode ser no futuro.';
  else if (ageFromISO(nasc) < MIN_AGE) e.dataNascimento = `É preciso ter pelo menos ${MIN_AGE} anos para criar a conta.`;
  if (!isValidEmail(d.email)) e.email = 'Informe um e-mail válido.';
  if (d.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Telefone com DDD (10 ou 11 dígitos).';
  if (!isValidCPF(d.cpf)) e.cpf = 'CPF inválido.';
  if (d.cep.replace(/\D/g, '').length !== 8) e.cep = 'CEP deve ter 8 dígitos.';
  if (d.senha.length < 6) e.senha = 'A senha precisa ter pelo menos 6 caracteres.';
  if (d.confirmarSenha !== d.senha) e.confirmarSenha = 'As senhas não conferem.';
  return e;
}

/**
 * Cria a conta no Firebase Auth, grava o perfil em `users/{uid}` no Firestore
 * e cria as categorias padrão do usuário.
 */
export async function registerUser(d: RegisterData): Promise<void> {
  const cred = await createUserWithEmailAndPassword(auth, d.email.trim(), d.senha);
  const user = cred.user;
  try {
    const nome = d.nome.trim();
    await updateProfile(user, { displayName: nome });
    const now = Date.now();
    await saveUserProfile({
      id: user.uid,
      nome,
      dataNascimento: brToISO(d.dataNascimento)!,
      email: d.email.trim(),
      telefone: d.telefone,
      cpf: d.cpf,
      cep: d.cep,
      provider: 'password',
      createdAt: now,
      updatedAt: now,
    });
    await seedDefaultCategories(user.uid);
  } catch (e) {
    // Não deixa uma conta "pela metade" (sem perfil no banco) caso o Firestore falhe.
    await deleteUser(user).catch(() => undefined);
    throw e;
  }
}
