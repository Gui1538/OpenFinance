import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface LoginScreenProps {
  navigation?: {
    navigate: (screen: string) => void;
  };
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !senha.trim()) {
      return;
    }
    navigation?.navigate('Home');
  };

  const handleGoogleLogin = () => {
    navigation?.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topSection}>
            <View style={styles.header}>
              <Text style={styles.title}>Bem-vindo de volta!</Text>
              <Text style={styles.subtitle}>Faça login para continuar</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <View style={styles.iconBox}>
                  <Text style={styles.inputEmoji}>✉️</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="E-mail"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconBox}>
                  <Text style={styles.inputEmoji}>🔒</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!mostrarSenha}
                  value={senha}
                  onChangeText={setSenha}
                />
                <TouchableOpacity
                  onPress={() => setMostrarSenha(!mostrarSenha)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeText}>{mostrarSenha ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLogin}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Entrar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createAccountButton}
                onPress={() => navigation?.navigate('Cadastro')}
                activeOpacity={0.7}
              >
                <Text style={styles.createAccountText}>Criar uma conta</Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
                activeOpacity={0.85}
              >
                <View style={styles.googleBadge}>
                  <Text style={styles.googleLetter}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Entrar com Google</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerIllustration}>
            <View style={styles.waveBackground} />

            <View style={styles.illustrationContent}>
              <View style={styles.chartArea}>
                <Text style={styles.trendSymbol}>↗</Text>
                <View style={styles.barsContainer}>
                  <View style={[styles.bar, { height: 26 }]} />
                  <View style={[styles.bar, { height: 40 }]} />
                  <View style={[styles.bar, { height: 56 }]} />
                  <View style={[styles.bar, { height: 74 }]} />
                </View>
              </View>

              <View style={styles.coinsArea}>
                <View style={styles.coinStack}>
                  <View style={styles.coin} />
                  <View style={styles.coin} />
                  <View style={styles.coin} />
                </View>
                <View style={styles.coinStack}>
                  <View style={styles.coin} />
                  <View style={styles.coin} />
                  <View style={styles.coin} />
                  <View style={styles.coin} />
                  <View style={styles.coin} />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7F4',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 14,
  },
  iconBox: {
    width: 26,
    alignItems: 'center',
    marginRight: 8,
  },
  inputEmoji: {
    fontSize: 16,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  eyeButton: {
    padding: 6,
  },
  eyeText: {
    fontSize: 16,
    opacity: 0.7,
  },
  primaryButton: {
    backgroundColor: '#0F8A44',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    elevation: 2,
    shadowColor: '#0F8A44',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createAccountButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  createAccountText: {
    color: '#0F8A44',
    fontSize: 14,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#6B7280',
    fontSize: 13,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    height: 48,
  },
  googleBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleLetter: {
    fontSize: 17,
    fontWeight: '700',
    color: '#DB4437',
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  footerIllustration: {
    marginTop: 28,
    height: 125,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  waveBackground: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    right: -30,
    height: 120,
    backgroundColor: '#DCEEE2',
    borderTopLeftRadius: 180,
    borderTopRightRadius: 120,
  },
  illustrationContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: 14,
    gap: 10,
  },
  chartArea: {
    alignItems: 'flex-start',
  },
  trendSymbol: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F8A44',
    marginBottom: -4,
    marginLeft: 4,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bar: {
    width: 18,
    backgroundColor: '#13934B',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  coinsArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  coinStack: {
    gap: 2,
  },
  coin: {
    width: 26,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    borderBottomWidth: 2,
    borderBottomColor: '#D97706',
  },
});