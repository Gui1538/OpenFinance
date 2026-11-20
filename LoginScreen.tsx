import { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type TelaAtual = 'welcome' | 'login' | 'cadastro' | 'home';

interface LoginScreenProps {
  navigation?: {
    navigate: (screen: string) => void;
  };
}

const GOOGLE_WEB_CLIENT_ID = '';

function formatarTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 7) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

function formatarCPF(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  if (digitos.length <= 3) return digitos;
  if (digitos.length <= 6) {
    return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
  }
  if (digitos.length <= 9) {
    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
  }
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
}

function formatarCEP(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 8);
  if (digitos.length <= 5) return digitos;
  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [tela, setTela] = useState<TelaAtual>('welcome');

  // Estados do Login
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erroLogin, setErroLogin] = useState('');
  const [avisoContaCriada, setAvisoContaCriada] = useState('');

  // Estados do Cadastro
  const [nomeCadastro, setNomeCadastro] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [telefoneCadastro, setTelefoneCadastro] = useState('');
  const [cpfCadastro, setCpfCadastro] = useState('');
  const [cepCadastro, setCepCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [erroCadastro, setErroCadastro] = useState('');

  // Estado do Google e Usuário logado
  const [modalGoogle, setModalGoogle] = useState(false);
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState('Usuário');
  const [infoExtraUsuario, setInfoExtraUsuario] = useState('');

  const concluirLoginGoogle = (nome: string, emailConta: string) => {
    setModalGoogle(false);
    setCarregandoGoogle(false);
    setUsuarioLogado(nome);
    setInfoExtraUsuario(`Google • ${emailConta}`);
    setEmail(emailConta);
    setErroLogin('');
    setTela('home');
    navigation?.navigate('Home');
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.type === 'OPENFINANCE_GOOGLE_AUTH') {
        concluirLoginGoogle(
          event.data.nome || 'Conta Google',
          event.data.email || 'conta.google@gmail.com'
        );
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const abrirLoginGoogleDiretoNoComputador = () => {
    setErroLogin('');

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      setCarregandoGoogle(true);

      const width = 500;
      const height = 620;
      const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
      const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);

      if (GOOGLE_WEB_CLIENT_ID.trim()) {
        const redirectUri = encodeURIComponent(window.location.origin);
        const scope = encodeURIComponent('openid email profile');
        const authUrl =
          `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
            GOOGLE_WEB_CLIENT_ID.trim()
          )}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=select_account`;

        const popup = window.open(
          authUrl,
          'GoogleLoginOpenFinance',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );

        if (!popup) {
          setCarregandoGoogle(false);
          setModalGoogle(true);
        }
        return;
      }

      const htmlPopup = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Fazer login — Contas do Google</title>
          <style>
            * { box-sizing: border-box; font-family: Arial, Helvetica, sans-serif; }
            body {
              margin: 0;
              background: #f0f4f9;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 16px;
            }
            .card {
              background: #ffffff;
              width: 100%;
              max-width: 400px;
              border-radius: 24px;
              padding: 32px 28px;
              box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
            }
            .logo { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
            .g1 { color: #4285F4; }
            .g2 { color: #EA4335; }
            .g3 { color: #FBBC05; }
            .g4 { color: #4285F4; }
            .g5 { color: #34A853; }
            .g6 { color: #EA4335; }
            h1 { font-size: 22px; font-weight: 500; margin: 0 0 6px; color: #1f1f1f; }
            p.sub { margin: 0 0 22px; color: #444746; font-size: 14px; }
            .account {
              display: flex;
              align-items: center;
              gap: 12px;
              width: 100%;
              padding: 12px;
              border: 1px solid #e0e3e7;
              border-radius: 12px;
              background: #ffffff;
              cursor: pointer;
              text-align: left;
              margin-bottom: 10px;
            }
            .account:hover { background: #f8fafd; }
            .avatar {
              width: 38px;
              height: 38px;
              border-radius: 50%;
              background: #0F8A44;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 16px;
              flex-shrink: 0;
            }
            .name { font-size: 14px; font-weight: 600; color: #1f1f1f; }
            .email { font-size: 12px; color: #444746; }
            .custom-box {
              margin-top: 14px;
              padding-top: 14px;
              border-top: 1px solid #e0e3e7;
            }
            input {
              width: 100%;
              padding: 10px 12px;
              border: 1px solid #c4c7c5;
              border-radius: 8px;
              font-size: 14px;
              margin-bottom: 10px;
            }
            .btn-primary {
              width: 100%;
              padding: 11px;
              border: none;
              border-radius: 999px;
              background: #0b57d0;
              color: #ffffff;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">
              <span class="g1">G</span><span class="g2">o</span><span class="g3">o</span><span class="g4">g</span><span class="g5">l</span><span class="g6">e</span>
            </div>
            <h1>Fazer login</h1>
            <p class="sub">Escolha uma conta para continuar no FinanceApp</p>

            <button class="account" onclick="escolher('Letícia Silva', 'leticia.silva@gmail.com')">
              <div class="avatar">L</div>
              <div>
                <div class="name">Letícia Silva</div>
                <div class="email">leticia.silva@gmail.com</div>
              </div>
            </button>

            <button class="account" onclick="escolher('Conta Google', 'openfinance.user@gmail.com')">
              <div class="avatar" style="background:#15803D;">G</div>
              <div>
                <div class="name">Conta Google</div>
                <div class="email">openfinance.user@gmail.com</div>
              </div>
            </button>

            <div class="custom-box">
              <input id="emailInput" type="email" placeholder="Ou digite seu e-mail @gmail.com" />
              <button class="btn-primary" onclick="usarEmailDigitado()">Continuar com este e-mail</button>
            </div>
          </div>

          <script>
            function escolher(nome, email) {
              if (window.opener) {
                window.opener.postMessage(
                  { type: 'OPENFINANCE_GOOGLE_AUTH', nome: nome, email: email },
                  window.location.origin
                );
              }
              window.close();
            }

            function usarEmailDigitado() {
              var val = document.getElementById('emailInput').value.trim();
              var emailFinal = val || 'usuario.google@gmail.com';
              var nomeParte = emailFinal.split('@')[0] || 'Usuário Google';
              escolher(nomeParte, emailFinal);
            }
          </script>
        </body>
        </html>
      `;

      const popup = window.open(
        '',
        'GoogleLoginOpenFinance',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (popup) {
        popup.document.open();
        popup.document.write(htmlPopup);
        popup.document.close();
        popup.focus();

        const timer = window.setInterval(() => {
          if (popup.closed) {
            window.clearInterval(timer);
            setCarregandoGoogle(false);
          }
        }, 400);
      } else {
        setCarregandoGoogle(false);
        setModalGoogle(true);
      }
      return;
    }

    setModalGoogle(true);
  };

  const handleLogin = () => {
    if (!email.trim() || !senha.trim()) {
      setErroLogin('Preencha o e-mail e a senha para entrar.');
      return;
    }
    setErroLogin('');
    const nomeExtraido = nomeCadastro.trim() || email.split('@')[0];
    setUsuarioLogado(nomeExtraido || 'Usuário');
    setInfoExtraUsuario(
      cepCadastro
        ? `CEP: ${cepCadastro} • ${email.trim()}`
        : email.trim()
    );
    setTela('home');
    navigation?.navigate('Home');
  };

  const handleCadastro = () => {
    const cpfLimpo = cpfCadastro.replace(/\D/g, '');
    const cepLimpo = cepCadastro.replace(/\D/g, '');
    const telLimpo = telefoneCadastro.replace(/\D/g, '');

    if (
      !nomeCadastro.trim() ||
      !emailCadastro.trim() ||
      telLimpo.length < 10 ||
      cpfLimpo.length !== 11 ||
      cepLimpo.length !== 8 ||
      !senhaCadastro.trim()
    ) {
      setErroCadastro(
        'Preencha Nome, E-mail, Telefone, CPF (11 dígitos), CEP (8 dígitos) e Senha.'
      );
      return;
    }

    setErroCadastro('');
    setEmail(emailCadastro.trim());
    setSenha(senhaCadastro);
    setAvisoContaCriada(
      `Conta criada para ${nomeCadastro.trim()}! Seus dados já estão preenchidos abaixo. Clique em "Entrar".`
    );
    setTela('login');
  };

  if (tela === 'welcome') {
    return (
      <SafeAreaView style={styles.welcomeContainer}>
        <View style={styles.welcomeTopContent}>
          <View style={styles.walletContainer}>
            <View style={styles.walletBackFlap} />
            <View style={styles.walletCoin}>
              <Text style={styles.walletCoinText}>$</Text>
            </View>
            <View style={styles.walletFrontBody}>
              <View style={styles.walletPocketTag}>
                <View style={styles.walletPocketDot} />
              </View>
            </View>
          </View>

          <Text style={styles.welcomeTitle}>FinanceApp</Text>
          <Text style={styles.welcomeSubtitle}>
            Controle suas finanças{'\n'}de forma simples!
          </Text>
        </View>

        <View style={styles.welcomeBottomWaveContainer}>
          <View style={styles.welcomeWaveShape} />
          <View style={styles.welcomeBottomAction}>
            <TouchableOpacity
              style={styles.welcomeButton}
              onPress={() => setTela('login')}
              activeOpacity={0.85}
            >
              <Text style={styles.welcomeButtonText}>Começar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (tela === 'cadastro') {
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
              <TouchableOpacity
                onPress={() => {
                  setErroCadastro('');
                  setTela('login');
                }}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>← Voltar para login</Text>
              </TouchableOpacity>

              <View style={styles.header}>
                <Text style={styles.title}>Criar uma conta</Text>
                <Text style={styles.subtitle}>
                  Preencha seus dados para liberar seu acesso
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <View style={styles.iconBox}>
                    <Text style={styles.inputEmoji}>👤</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    placeholderTextColor="#9CA3AF"
                    value={nomeCadastro}
                    onChangeText={setNomeCadastro}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.iconBox}>
                    <Text style={styles.inputEmoji}>✉️</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="E-mail (será seu login)"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={emailCadastro}
                    onChangeText={setEmailCadastro}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.iconBox}>
                    <Text style={styles.inputEmoji}>📱</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Telefone (ex: (61) 99999-9999)"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={telefoneCadastro}
                    onChangeText={(text) => setTelefoneCadastro(formatarTelefone(text))}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.iconBox}>
                    <Text style={styles.inputEmoji}>🪪</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="CPF (ex: 000.000.000-00)"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={cpfCadastro}
                    onChangeText={(text) => setCpfCadastro(formatarCPF(text))}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.iconBox}>
                    <Text style={styles.inputEmoji}>📍</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="CEP (ex: 70000-000)"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={cepCadastro}
                    onChangeText={(text) => setCepCadastro(formatarCEP(text))}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.iconBox}>
                    <Text style={styles.inputEmoji}>🔒</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Crie uma senha para entrar"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={senhaCadastro}
                    onChangeText={setSenhaCadastro}
                  />
                </View>

                {erroCadastro ? (
                  <Text style={styles.errorText}>{erroCadastro}</Text>
                ) : null}

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleCadastro}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryButtonText}>Criar Conta e Ir para Login</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footerIllustration}>
              <View style={styles.waveBackground} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (tela === 'home') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.homeHeader}>
          <View style={styles.flex}>
            <Text style={styles.homeGreeting}>Olá, {usuarioLogado}!</Text>
            <Text style={styles.homeSubGreeting}>{infoExtraUsuario}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              setAvisoContaCriada('');
              setTela('welcome');
            }}
          >
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Atual</Text>
          <Text style={styles.balanceValue}>R$ 1.250,00</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Receitas</Text>
            <Text style={styles.incomeValue}>R$ 2.500,00</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Despesas</Text>
            <Text style={styles.expenseValue}>R$ 1.250,00</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
            <TouchableOpacity
              onPress={() => setTela('welcome')}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Início</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Bem-vindo de volta!</Text>
              <Text style={styles.subtitle}>Faça login para continuar</Text>
            </View>

            {avisoContaCriada ? (
              <View style={styles.successBanner}>
                <Text style={styles.successBannerText}>{avisoContaCriada}</Text>
              </View>
            ) : null}

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
                  onChangeText={(text) => {
                    setEmail(text);
                    setErroLogin('');
                  }}
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
                  onChangeText={(text) => {
                    setSenha(text);
                    setErroLogin('');
                  }}
                />
                <TouchableOpacity
                  onPress={() => setMostrarSenha(!mostrarSenha)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeText}>{mostrarSenha ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>

              {erroLogin ? <Text style={styles.errorText}>{erroLogin}</Text> : null}

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLogin}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Entrar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createAccountButton}
                onPress={() => {
                  setErroLogin('');
                  setAvisoContaCriada('');
                  setTela('cadastro');
                }}
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
                onPress={abrirLoginGoogleDiretoNoComputador}
                activeOpacity={0.85}
              >
                <View style={styles.googleBadge}>
                  <Text style={styles.googleLetter}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>
                  {carregandoGoogle ? 'Abrindo login Google...' : 'Entrar com Google'}
                </Text>
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

      <Modal
        visible={modalGoogle}
        transparent
        animationType="fade"
        onRequestClose={() => setModalGoogle(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalGoogleTitle}>Escolha uma conta Google</Text>
            <Text style={styles.modalGoogleSub}>para acessar o FinanceApp</Text>

            <TouchableOpacity
              style={styles.accountOption}
              onPress={() =>
                concluirLoginGoogle('Letícia Silva', 'leticia.silva@gmail.com')
              }
            >
              <View style={styles.accountAvatar}>
                <Text style={styles.accountAvatarText}>L</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.accountName}>Letícia Silva</Text>
                <Text style={styles.accountEmail}>leticia.silva@gmail.com</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.accountOption}
              onPress={() =>
                concluirLoginGoogle('Conta Google', 'openfinance.user@gmail.com')
              }
            >
              <View style={[styles.accountAvatar, { backgroundColor: '#15803D' }]}>
                <Text style={styles.accountAvatarText}>G</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.accountName}>Conta Google</Text>
                <Text style={styles.accountEmail}>openfinance.user@gmail.com</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalGoogle(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#F7FAF8',
    justifyContent: 'space-between',
  },
  welcomeTopContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  walletContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  walletBackFlap: {
    width: 84,
    height: 18,
    backgroundColor: '#15803D',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: -12,
  },
  walletCoin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -12,
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  walletCoinText: {
    color: '#92400E',
    fontWeight: '800',
    fontSize: 16,
  },
  walletFrontBody: {
    width: 96,
    height: 64,
    backgroundColor: '#16A34A',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 1,
  },
  walletPocketTag: {
    width: 30,
    height: 24,
    backgroundColor: '#15803D',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    justifyContent: 'center',
    paddingLeft: 8,
  },
  walletPocketDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  welcomeBottomWaveContainer: {
    height: 195,
    justifyContent: 'flex-end',
    position: 'relative',
    overflow: 'hidden',
  },
  welcomeWaveShape: {
    position: 'absolute',
    top: 10,
    left: -60,
    right: -60,
    bottom: -40,
    backgroundColor: '#0E8A42',
    borderTopLeftRadius: 240,
    borderTopRightRadius: 160,
  },
  welcomeBottomAction: {
    paddingHorizontal: 28,
    paddingBottom: 34,
    zIndex: 2,
  },
  welcomeButton: {
    backgroundColor: '#149B4C',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4ADE80',
  },
  welcomeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
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
    paddingTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingVertical: 4,
  },
  backButtonText: {
    color: '#0F8A44',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
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
    textAlign: 'center',
  },
  successBanner: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  successBannerText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
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
    height: 48,
    marginBottom: 12,
  },
  iconBox: {
    width: 26,
    alignItems: 'center',
    marginRight: 8,
  },
  inputEmoji: {
    fontSize: 16,
    opacity: 0.75,
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
    opacity: 0.75,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#0F8A44',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createAccountButton: {
    alignItems: 'center',
    marginTop: 14,
  },
  createAccountText: {
    color: '#0F8A44',
    fontSize: 14,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
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
    marginTop: 22,
    height: 118,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  waveBackground: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    right: -30,
    height: 112,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
  },
  modalGoogleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalGoogleSub: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 18,
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  accountAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F8A44',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  accountEmail: {
    fontSize: 13,
    color: '#6B7280',
  },
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  modalCancelText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
    gap: 12,
  },
  homeGreeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  homeSubGreeting: {
    fontSize: 13,
    color: '#0F8A44',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 13,
  },
  balanceCard: {
    backgroundColor: '#0F8A44',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 22,
    marginBottom: 16,
  },
  balanceLabel: {
    color: '#D1FAE5',
    fontSize: 14,
    marginBottom: 6,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  incomeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F8A44',
  },
  expenseValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
});