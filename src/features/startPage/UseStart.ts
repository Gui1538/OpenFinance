import { router } from 'expo-router';
import { START_CONTENT } from './StartAPI';

export function useStart() {
  return {
    content: START_CONTENT,
    /** Tela inicial -> Login */
    goToLogin: () => router.push('/Login'),
  };
}
