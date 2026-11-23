import { Ionicons } from '@expo/vector-icons';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Header } from '@/components/ui';
import { colors, radius, shadow } from '@/theme';
import { formatCurrency, formatDateTime, formatPercent } from '@/utils/format';
import type { Quote } from './InvestmentsAPI';
import { useInvestments } from './UseInvestments';

const BADGE: Record<string, { text: string; bg: string }> = {
  USD: { text: '🇺🇸', bg: '#EEF2FF' },
  EUR: { text: '🇪🇺', bg: '#EEF2FF' },
  BTC: { text: '₿', bg: '#FEF3C7' },
  ETH: { text: 'Ξ', bg: '#E0E7FF' },
};

function QuoteCard({ q }: { q: Quote }) {
  const up = q.changePct >= 0;
  const badge = BADGE[q.code];
  return (
    <View style={styles.quote}>
      <View style={[styles.badge, { backgroundColor: badge?.bg ?? colors.primaryLight }]}>
        <Text style={{ fontSize: badge ? 22 : 12, fontWeight: '800', color: colors.primaryDark }}>
          {badge?.text ?? q.code.slice(0, 4)}
        </Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.qName} numberOfLines={1}>{q.name}</Text>
        <Text style={styles.qCode}>{q.code}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.qPrice}>{formatCurrency(q.price)}</Text>
        <View style={styles.change}>
          <Ionicons name={up ? 'caret-up' : 'caret-down'} size={12} color={up ? colors.success : colors.danger} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: up ? colors.success : colors.danger }}>
            {formatPercent(q.changePct)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function Section({ title, items }: { title: string; items: Quote[] }) {
  if (!items.length) return null;
  return (
    <View>
      <Text style={styles.section}>{title}</Text>
      {items.map((q) => (
        <QuoteCard key={q.code} q={q} />
      ))}
    </View>
  );
}

/** Tela "Cotação de Moedas" + investimentos (criptos e ações) */
export default function Investments() {
  const v = useInvestments();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title="Cotações" onBack={v.goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={v.loading} onRefresh={v.refresh} colors={[colors.primary]} />}
      >
        <Text style={styles.lead}>Confira a cotação atual das moedas e de alguns investimentos.</Text>

        {v.fromCache && v.snapshot ? (
          <View style={styles.notice}>
            <Ionicons name="cloud-offline-outline" size={18} color={colors.warning} />
            <Text style={styles.noticeText}>
              {v.isOnline ? 'Não foi possível atualizar agora.' : 'Você está offline.'} Exibindo a última cotação salva no aparelho.
            </Text>
          </View>
        ) : null}

        {v.error && !v.snapshot ? (
          <View style={[styles.notice, { backgroundColor: colors.dangerLight }]}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={[styles.noticeText, { color: colors.danger }]}>{v.error}</Text>
          </View>
        ) : null}

        <Section title="Moedas" items={v.currencies} />
        <Section title="Criptomoedas" items={v.crypto} />
        <Section title="Ações (B3)" items={v.stocks} />

        {v.snapshot ? (
          <View style={styles.updated}>
            <Ionicons name="refresh" size={14} color={colors.primary} />
            <Text style={styles.updatedText}>Atualizado em: {formatDateTime(v.snapshot.fetchedAt)}</Text>
          </View>
        ) : null}

        <Button title="Atualizar Cotação" onPress={v.refresh} loading={v.loading} style={{ marginTop: 14 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 32 },
  lead: { textAlign: 'center', color: colors.muted, fontSize: 14, marginBottom: 6 },
  section: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 18, marginBottom: 10 },
  quote: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.md, padding: 14, marginBottom: 10, ...shadow },
  badge: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  qName: { fontSize: 15, fontWeight: '700', color: colors.text },
  qCode: { fontSize: 12, color: colors.muted, marginTop: 2 },
  qPrice: { fontSize: 17, fontWeight: '800', color: colors.text },
  change: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.warningLight, padding: 12, borderRadius: radius.md, marginTop: 10 },
  noticeText: { flex: 1, fontSize: 13, color: colors.warning },
  updated: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 },
  updatedText: { fontSize: 12, color: colors.muted },
});
