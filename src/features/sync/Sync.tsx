import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Header } from '@/components/ui';
import { colors } from '@/theme';
import { formatDateTime } from '@/utils/format';
import { useSyncScreen } from './UseSync';

/** Tela "Sincronização" */
export default function Sync() {
  const s = useSyncScreen();
  const plural = s.pending === 1 ? 'alteração' : 'alterações';

  const view = {
    syncing: { icon: null, tint: colors.primary, title: 'Sincronizando...', msg: 'Enviando seus dados para a nuvem.' },
    synced: { icon: 'cloud-done-outline', tint: colors.primary, title: 'Dados sincronizados!', msg: 'Seus dados foram enviados para a nuvem com sucesso.' },
    'pending-offline': {
      icon: 'cloud-offline-outline', tint: colors.danger, title: 'Você está offline',
      msg: s.pending > 0
        ? `${s.pending} ${plural} salva${s.pending === 1 ? '' : 's'} no aparelho. Elas serão enviadas assim que a conexão voltar.`
        : 'Seus dados continuam disponíveis no aparelho e serão sincronizados quando a conexão voltar.',
    },
    error: {
      icon: 'alert-circle-outline', tint: colors.warning, title: 'Sincronização pendente',
      msg: s.errorMessage
        ? `Não foi possível concluir: ${s.errorMessage}`
        : `${s.pending} ${plural} ainda não ${s.pending === 1 ? 'foi enviada' : 'foram enviadas'} para a nuvem.`,
    },
  }[s.status];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title="Sincronização" onBack={s.goBack} />
      <View style={styles.body}>
        {view.icon ? <Ionicons name={view.icon as 'cloud-done-outline'} size={120} color={view.tint} /> : <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />}
        <Text style={styles.title}>{view.title}</Text>
        <Text style={styles.msg}>{view.msg}</Text>
        {s.status === 'synced' && s.lastSyncAt ? <Text style={styles.small}>Última sincronização: {formatDateTime(s.lastSyncAt)}</Text> : null}
      </View>
      <View style={styles.footer}>
        {s.status === 'error' ? <Button title="Tentar novamente" onPress={s.retry} style={{ marginBottom: 10 }} /> : null}
        <Button title="Voltar" variant={s.status === 'error' ? 'outline' : 'primary'} onPress={s.goBack} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 20, textAlign: 'center' },
  msg: { fontSize: 15, color: colors.muted, marginTop: 8, textAlign: 'center', lineHeight: 22 },
  small: { fontSize: 12, color: colors.muted, marginTop: 14 },
  footer: { padding: 24 },
});
