import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Field } from '@/components/ui';
import { colors } from '@/theme';
import { useRegister } from './UseRegister';

export default function Register() {
  const f = useRegister();
  const { data, errors, setField } = f;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={f.goToLogin} style={styles.back} hitSlop={12} accessibilityLabel="Voltar para o login">
            <Ionicons name="chevron-back" size={26} color={colors.text} />
            <Text style={styles.backText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Criar uma conta</Text>
          <Text style={styles.subtitle}>Preencha seus dados para começar</Text>

          <View style={{ marginTop: 22 }}>
            <Field icon="person-outline" placeholder="Nome completo" autoCapitalize="words" value={data.nome} onChangeText={setField('nome')} error={errors.nome} />
            <Field icon="calendar-outline" placeholder="Data de nascimento (dd/mm/aaaa)" keyboardType="numeric" value={data.dataNascimento} onChangeText={setField('dataNascimento')} error={errors.dataNascimento} maxLength={10} />
            <Field icon="mail-outline" placeholder="E-mail (será seu login)" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={data.email} onChangeText={setField('email')} error={errors.email} />
            <Field icon="call-outline" placeholder="Telefone (ex: (61) 99999-9999)" keyboardType="phone-pad" value={data.telefone} onChangeText={setField('telefone')} error={errors.telefone} />
            <Field icon="id-card-outline" placeholder="CPF (ex: 000.000.000-00)" keyboardType="numeric" value={data.cpf} onChangeText={setField('cpf')} error={errors.cpf} />
            <Field icon="location-outline" placeholder="CEP (ex: 70000-000)" keyboardType="numeric" value={data.cep} onChangeText={setField('cep')} error={errors.cep} />
            <Field
              icon="lock-closed-outline"
              placeholder="Crie uma senha (mín. 6 caracteres)"
              secureTextEntry={!f.showPassword}
              value={data.senha}
              onChangeText={setField('senha')}
              rightIcon={f.showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightPress={f.toggleShowPassword}
              error={errors.senha}
            />
            <Field
              icon="lock-closed-outline"
              placeholder="Confirme a senha"
              secureTextEntry={!f.showPassword}
              value={data.confirmarSenha}
              onChangeText={setField('confirmarSenha')}
              error={errors.confirmarSenha}
              onSubmitEditing={f.submit}
            />

            <Button title="Criar conta" onPress={f.submit} loading={f.loading} style={{ marginTop: 4 }} />

            <TouchableOpacity onPress={f.goToLogin} style={styles.link} activeOpacity={0.7}>
              <Text style={styles.linkMuted}>
                Já tem conta? <Text style={styles.linkText}>Entrar</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 18, marginLeft: -6 },
  backText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 6 },
  link: { alignItems: 'center', marginTop: 18 },
  linkMuted: { color: colors.muted, fontSize: 14 },
  linkText: { color: colors.primary, fontWeight: '700' },
});
