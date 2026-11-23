import {
  GoogleAuthProvider,
  getAdditionalUserInfo,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from '@/services/firebase';
import { saveUserProfile, seedDefaultCategories } from '@/services/userProfile';
import { isValidEmail } from '@/utils/format';

const AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'O e-mail informado é inválido.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um instante e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com a internet. Conecte-se para entrar ou criar sua conta.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/popup-closed-by-user': 'A janela de login do Google foi fechada antes de concluir.',
  'auth/cancelled-popup-request': 'A janela de login do Google foi fechada antes de concluir.',
  'auth/popup-blocked': 'O navegador bloqueou a janela do Google. Libere pop-ups para este site.',
  'auth/operation-not-allowed':
    'Este método de login não está ativado no Firebase (Console > Authentication > Sign-in method).',
  'auth/unauthorized-domain':
    'Este domínio não está autorizado no Firebase (Console > Authentication > Settings > Authorized domains).',
};

export function mapAuthError(e: unknown): string {
  const code = (e as { code?: string })?.code;
  if (code && AUTH_MESSAGES[code]) return AUTH_MESSAGES[code];
  if (e instanceof Error && e.message) return e.message;
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

export interface LoginErrors {
  email?: string;
  senha?: string;
}

export function validateLogin(email: string, senha: string): LoginErrors {
  const errors: LoginErrors = {};
  if (!email.trim()) errors.email = 'Informe o e-mail.';
  else if (!isValidEmail(email)) errors.email = 'E-mail inválido.';
  if (!senha) errors.senha = 'Informe a senha.';
  return errors;
}

export async function loginWithEmail(email: string, senha: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), senha);
  return cred.user;
}

/** Login com Google (web via pop-up do Firebase). No celular precisa de configuração extra de OAuth. */
export async function loginWithGoogle(): Promise<User> {
  if (Platform.OS !== 'web') {
    throw new Error(
      'O login com Google no celular precisa de configuração de OAuth (expo-auth-session). Por enquanto use e-mail e senha.',
    );
  }
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  const user = result.user;

  if (getAdditionalUserInfo(result)?.isNewUser) {
    const now = Date.now();
    await saveUserProfile({
      id: user.uid,
      dataNascimento: '', // o Google não informa; pode ser completada depois
      nome: user.displayName ?? user.email?.split('@')[0] ?? 'Usuário',
      email: user.email ?? '',
      telefone: '',
      cpf: '',
      cep: '',
      provider: 'google',
      createdAt: now,
      updatedAt: now,
    });
    await seedDefaultCategories(user.uid);
  }
  return user;
}

export function logout(): Promise<void> {
  return signOut(auth);
}
