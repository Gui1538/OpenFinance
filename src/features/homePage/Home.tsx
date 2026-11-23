import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { colors, radius, shadow } from '@/theme';
import { formatCurrency } from '@/utils/format';
import { useHome } from './UseHome';

function Donut({ revenuePct, hasData }: { revenuePct: number; hasData: boolean }) {
  const size = 110;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const revLen = (revenuePct / 100) * c;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={hasData ? colors.danger : '#E5E7EB'} strokeWidth={stroke} fill="none" />
      {hasData ? (
        <Circle
          cx={size / 2} cy={size / 2} r={r} stroke={colors.primary} strokeWidth={stroke} fill="none"
          strokeDasharray={`${revLen} ${c - revLen}`} strokeDashoffset={c / 4}
        />
      ) : null}
    </Svg>
  );
}

export default function Home() {
  const h = useHome();
  const { summary } = h;
  const money = (v: number) => (h.hideBalance ? 'R$ ••••' : formatCurrency(v));

  const syncIcon = !h.isOnline ? 'cloud-offline-outline' : h.pending > 0 ? 'cloud-upload-outline' : 'cloud-done-outline';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Text style={styles.hello}>Olá, {h.firstName}!</Text>
          <TouchableOpacity onPress={h.goSync} style={styles.iconBtn} accessibilityLabel="Sincronização">
            <Ionicons name={syncIcon} size={22} color={h.isOnline ? colors.text : colors.danger} />
            {h.pending > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{h.pending > 9 ? '9+' : h.pending}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity onPress={h.signOut} style={styles.iconBtn} accessibilityLabel="Sair">
            <Ionicons name="log-out-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.balanceLabel}>Saldo Atual</Text>
            <Text style={styles.balanceValue}>{money(summary.balance)}</Text>
          </View>
          <TouchableOpacity onPress={h.toggleBalance} hitSlop={12} accessibilityLabel="Mostrar ou ocultar saldo">
            <Ionicons name={h.hideBalance ? 'eye-off' : 'eye'} size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.miniCard}>
            <View style={styles.miniHead}>
              <Ionicons name="arrow-up" size={16} color={colors.primary} />
              <Text style={styles.miniLabel}>Receitas</Text>
            </View>
            <Text style={styles.miniValue}>{money(summary.totalRevenue)}</Text>
          </View>
          <View style={styles.miniCard}>
            <View style={styles.miniHead}>
              <Ionicons name="arrow-down" size={16} color={colors.danger} />
              <Text style={styles.miniLabel}>Despesas</Text>
            </View>
            <Text style={styles.miniValue}>{money(summary.totalExpense)}</Text>
          </View>
        </View>

        <Text style={styles.section}>Resumo do Mês</Text>
        <View style={styles.card}>
          <Donut revenuePct={h.revenuePct} hasData={h.hasMonthData} />
          <View style={{ flex: 1, marginLeft: 20 }}>
            <View style={styles.legend}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Receitas</Text>
              <Text style={styles.legendPct}>{h.revenuePct}%</Text>
            </View>
            <View style={styles.legend}>
              <View style={[styles.dot, { backgroundColor: colors.danger }]} />
              <Text style={styles.legendText}>Despesas</Text>
              <Text style={styles.legendPct}>{h.expensePct}%</Text>
            </View>
            {!h.hasMonthData ? <Text style={styles.muted}>Sem movimentações neste mês.</Text> : null}
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>Últimas Movimentações</Text>
          <TouchableOpacity onPress={h.goMovements}>
            <Text style={styles.seeAll}>Ver todas ›</Text>
          </TouchableOpacity>
        </View>

        {summary.recent.length === 0 ? (
          <Text style={[styles.muted, { marginTop: 8 }]}>Nenhuma movimentação ainda. Cadastre uma receita ou despesa.</Text>
        ) : (
          summary.recent.map((m) => {
            const income = m.kind === 'revenue';
            return (
              <View key={`${m.kind}-${m.id}`} style={styles.move}>
                <View style={[styles.moveIcon, { backgroundColor: income ? colors.primary : colors.danger }]}>
                  <Ionicons name={income ? 'arrow-up' : 'arrow-down'} size={18} color="#fff" />
                </View>
                <Text style={styles.moveTitle} numberOfLines={1}>{m.title}</Text>
                <Text style={[styles.moveAmount, { color: income ? colors.primary : colors.danger }]}>
                  {income ? '+ ' : '- '}{formatCurrency(m.amount)}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 32 },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 6 },
  hello: { flex: 1, fontSize: 22, fontWeight: '800', color: colors.text },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  balanceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.lg, padding: 20 },
  balanceLabel: { color: '#D1FAE5', fontSize: 14 },
  balanceValue: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 4 },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  miniCard: { flex: 1, backgroundColor: '#fff', borderRadius: radius.md, padding: 14, ...shadow },
  miniHead: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  miniLabel: { fontSize: 13, color: colors.muted },
  miniValue: { fontSize: 17, fontWeight: '800', color: colors.text, marginTop: 6 },
  section: { fontSize: 17, fontWeight: '800', color: colors.text, marginTop: 22, marginBottom: 10 },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  seeAll: { color: colors.primary, fontWeight: '700', marginBottom: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.md, padding: 16, ...shadow },
  legend: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { flex: 1, fontSize: 14, color: colors.text },
  legendPct: { fontSize: 14, fontWeight: '800', color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
  move: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  moveIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  moveTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  moveAmount: { fontSize: 15, fontWeight: '800' },
});
