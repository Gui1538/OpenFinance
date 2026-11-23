import { useState } from 'react';
import { mapAuthError } from '@/features/auth/AuthAPI';
import { useFeedback } from '@/providers/FeedbackProvider';
import { maskCEP, maskCPF, maskDate, maskPhone } from '@/utils/format';
import { goBack } from '@/utils/navigation';
import {
  EMPTY_REGISTER, registerUser, validateRegister, type RegisterData, type RegisterErrors,
} from './RegisterAPI';

const MASKS: Partial<Record<keyof RegisterData, (v: string) => string>> = {
  dataNascimento: maskDate,
  telefone: maskPhone,
  cpf: maskCPF,
  cep: maskCEP,
};

export function useRegister() {
  const { showFeedback } = useFeedback();
  const [data, setData] = useState<RegisterData>(EMPTY_REGISTER);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const setField = (key: keyof RegisterData) => (value: string) => {
    const masked = MASKS[key] ? MASKS[key]!(value) : value;
    setData((d) => ({ ...d, [key]: masked }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async () => {
    const found = validateRegister(data);
    setErrors(found);
    const first = Object.values(found)[0];
    if (first) {
      showFeedback({ type: 'error', title: 'Verifique os dados', message: first });
      return;
    }
    setLoading(true);
    try {
      await registerUser(data);
      // O usuário já fica logado; o guard de rotas o leva à Home e este aviso permanece por cima.
      showFeedback({
        type: 'success',
        title: 'Conta criada!',
        message: `Bem-vindo(a), ${data.nome.trim().split(' ')[0]}! Suas categorias padrão já estão prontas.`,
        buttonLabel: 'Começar',
      });
    } catch (e) {
      showFeedback({ type: 'error', title: 'Não foi possível criar a conta', message: mapAuthError(e) });
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    errors,
    loading,
    showPassword,
    setField,
    toggleShowPassword: () => setShowPassword((v) => !v),
    submit,
    /** Cadastro -> Login */
    goToLogin: () => goBack('/Login'),
  };
}
