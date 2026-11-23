import { AuthProvider, useAuthUser } from '@/providers/AuthProvider';
import { FeedbackProvider } from '@/providers/FeedbackProvider';
import { SyncProvider } from '@/providers/SyncProvider';
import { colors } from '@/theme';
import { router, Stack, useRootNavigationState, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

/** Rotas de visitante: tela inicial ("/"), login e cadastro. Todo o resto exige estar logado. */
function isPublicArea(first: string | undefined) {
  return first === undefined || first === 'index' || first === '(auth)';
}

function RootNavigator() {
  const { user, loading } = useAuthUser();
  const segments = useSegments();
  const navState = useRootNavigationState();
  const navReady = !!navState?.key;

  const first = segments[0] as string | undefined;
  // telas de desenvolvimento / não encontrada não passam pelo guard (a +not-found redireciona sozinha)
  const exempt = first === '_sitemap' || first === '+not-found';
  const target: '/Home' | '/' | null =
    exempt || loading ? null : user && isPublicArea(first) ? '/Home' : !user && !isPublicArea(first) ? '/' : null;

  // Guard de rotas: visitante só vê início/login/cadastro; logado só vê o app.
  useEffect(() => {
    if (navReady && target) router.replace(target);
  }, [navReady, target]);

  const showLoader = loading || !!target;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
      {showLoader ? (
        <View style={styles.loader} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}
    </>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <FeedbackProvider>
        <SyncProvider>
          <RootNavigator />
        </SyncProvider>
      </FeedbackProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
