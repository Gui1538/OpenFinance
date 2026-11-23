// O pacote "firebase/auth" só expõe getReactNativePersistence nos tipos do bundle React Native;
// em runtime o Metro já resolve a versão certa. Esta declaração corrige o tipo para o TypeScript.
import type { Persistence } from 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
