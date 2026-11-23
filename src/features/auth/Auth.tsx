import { GoogleLogo } from '@/components/GoogleLogo';
import { Button, Field } from '@/components/ui';
import { colors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogin } from './UseAuth';

export default function Auth() {
  const f = useLogin();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.top}>
            <TouchableOpacity onPress={f.goToStart} style={styles.back} hitSlop={12} accessibilityLabel="Voltar para a tela inicial">
              <Ionicons name="chevron-back" size={26} color={colors.text} />
              <Text style={styles.backText}>Início</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Bem-vindo de volta!</Text>
            <Text style={styles.subtitle}>Faça login para continuar</Text>

            <View style={{ marginTop: 22 }}>
              <Field
                icon="mail-outline"
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={f.email}
                onChangeText={f.setEmail}
                error={f.errors.email}
              />
              <Field
                icon="lock-closed-outline"
                placeholder="Senha"
                secureTextEntry={!f.showPassword}
                value={f.senha}
                onChangeText={f.setSenha}
                rightIcon={f.showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightPress={f.toggleShowPassword}
                error={f.errors.senha}
                onSubmitEditing={f.submit}
              />

              <Button title="Entrar" onPress={f.submit} loading={f.loading} />

              <TouchableOpacity onPress={f.goToRegister} style={styles.link} activeOpacity={0.7}>
                <Text style={styles.linkText}>Criar uma conta</Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity style={styles.google} onPress={f.google} disabled={f.googleLoading} activeOpacity={0.85}>
                <View style={{ marginRight: 10 }}><GoogleLogo size={20} /></View>
                <Text style={styles.googleText}>{f.googleLoading ? 'Abrindo o Google...' : 'Entrar com Google'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.illustration}>
            <View style={styles.bars}>
              {[26, 40, 56, 74].map((h) => (
                <View key={h} style={[styles.bar, { height: h }]} />
              ))}
            </View>
            <View style={styles.coins}>
              {[3, 5].map((n) => (
                <View key={n} style={{ gap: 2 }}>
                  {Array.from({ length: n }).map((_, i) => (
                    <View key={i} style={styles.coin} />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, justifyContent: 'space-between' },
  top: { paddingHorizontal: 24, paddingTop: 8 },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 18, marginLeft: -6 },
  backText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 6 },
  link: { alignItems: 'center', marginTop: 16 },
  linkText: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 12, color: colors.muted, fontSize: 13 },
  google: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff',
  },
  googleText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  illustration: {
    height: 120, marginTop: 24, backgroundColor: '#E8F5EC', borderTopLeftRadius: 120, borderTopRightRadius: 80,
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 14, paddingBottom: 14,
  },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bar: { width: 18, backgroundColor: colors.primary, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  coins: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  coin: { width: 26, height: 8, borderRadius: 4, backgroundColor: '#F5B301', borderBottomWidth: 2, borderBottomColor: '#D97706' },
});
