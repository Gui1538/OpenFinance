import { router } from 'expo-router';
import { useState } from 'react';
import { useFeedback } from '@/providers/FeedbackProvider';
import { goBack } from '@/utils/navigation';
import { loginWithEmail, loginWithGoogle, mapAuthError, validateLogin, type LoginErrors } from './AuthAPI';

export function useLogin() {
  const { showFeedback } = useFeedback();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const fail = (message: string) => showFeedback({ type: 'error', title: 'Não foi possível entrar', message });

  // Ao concluir o login o guard de rotas (Stack.Protected) leva o usuário para a Home automaticamente.
  const submit = async () => {
    const found = validateLogin(email, senha);
    setErrors(found);
    if (Object.keys(found).length) {
      fail(found.email ?? found.senha ?? 'Verifique os campos.');
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, senha);
    } catch (e) {
      fail(mapAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (e) {
      fail(mapAuthError(e));
    } finally {
      setGoogleLoading(false);
    }
  };

  return {
    email,
    senha,
    showPassword,
    errors,
    loading,
    googleLoading,
    setEmail: (v: string) => {
      setEmail(v);
      setErrors((e) => ({ ...e, email: undefined }));
    },
    setSenha: (v: string) => {
      setSenha(v);
      setErrors((e) => ({ ...e, senha: undefined }));
    },
    toggleShowPassword: () => setShowPassword((v) => !v),
    submit,
    google,
    /** Login -> tela inicial */
    goToStart: () => goBack('/'),
    /** Login -> Cadastro */
    goToRegister: () => router.push('/Register'),
  };
}
