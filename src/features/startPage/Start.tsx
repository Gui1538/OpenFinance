import { colors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useStart } from './UseStart';

export default function Start() {
  const { content, goToLogin } = useStart();
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.top}>
        <View style={styles.logo}>
          <Ionicons name="wallet" size={74} color={colors.primary} />
        </View>
        <Text style={styles.title}>{content.appName}</Text>
        <Text style={styles.subtitle}>{content.tagline}</Text>
      </View>

      <View style={styles.bottom}>
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 220" preserveAspectRatio="none">
          <Path d="M0 60 C 90 10, 170 20, 250 55 S 360 80, 400 40 L400 220 L0 220 Z" fill={colors.primary} />
        </Svg>
        <TouchableOpacity style={styles.button} onPress={goToLogin} activeOpacity={0.85} accessibilityRole="button">
          <Text style={styles.buttonText}>{content.cta}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2FAF4' },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  logo: {
    width: 130, height: 130, borderRadius: 36, backgroundColor: '#fff', alignItems: 'center',
    justifyContent: 'center', marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.08,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  title: { fontSize: 34, fontWeight: '800', color: colors.primaryDark, marginBottom: 8 },
  subtitle: { fontSize: 17, color: colors.text, textAlign: 'center', lineHeight: 24 },
  bottom: { height: 210, justifyContent: 'flex-end', paddingHorizontal: 32, paddingBottom: 40 },
  button: {
    height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff',
  },
  buttonText: {  color: '#16A34A', fontSize: 17, fontWeight: '700' },
});
