import { router, type Href } from 'expo-router';

/** Volta uma tela; se não houver histórico (ex.: app aberto direto nessa tela), vai para `fallback`. */
export function goBack(fallback: Href = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
