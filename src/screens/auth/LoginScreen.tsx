/**
 * LoginScreen — Ecrã de início de sessão
 * Segue exatamente o design do mockup HTML
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '@/context/AuthContext';
import { useTheme, fontFamily, fontSize, spacing, borderRadius } from '@/theme';
import Input from '@/components/Input';
import Button from '@/components/Button';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

interface LoginScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login } = useAuth();
  const { colors, toggleTheme, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email é obrigatório';
    if (!password.trim()) newErrors.password = 'Password é obrigatória';
    else if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert('Indisponível', 'Este dispositivo não suporta autenticação biométrica');
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('Indisponível', 'Nenhuma biometria registada no dispositivo');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticar-se na Kempaga',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar password',
      });

      if (result.success) {
        // Biometria verificada — só funciona se já tiver credenciais guardadas
        Alert.alert(
          'Biometria Verificada',
          'Para usar login biométrico, inicie sessão primeiro com email e password.'
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro na autenticação biométrica');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Efeito de brilho de fundo */}
        <View
          style={[
            styles.glowEffect,
            { backgroundColor: isDark ? 'rgba(135,44,203,0.1)' : 'rgba(135,44,203,0.15)' },
          ]}
        />

        {/* Header: Logo + Theme Toggle */}
        <View style={styles.header}>
          <Text style={styles.logo}>
            <Text style={{ color: colors.brandPurple }}>Kem</Text>
            <Text style={{ color: colors.brandGreen }}>paga</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.themeToggle,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={toggleTheme}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={20}
              color={isDark ? '#fbbf24' : colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Títulos */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
            Bem-vindo{'\n'}de volta! 👋
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: colors.textMuted, fontFamily: fontFamily.medium },
            ]}
          >
            Aceda à sua carteira digital.
          </Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <Input
            icon="at"
            placeholder="E-mail ou Nº de Telefone"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />

          <Input
            icon="lock-closed-outline"
            placeholder="Palavra-passe"
            value={password}
            onChangeText={setPassword}
            isPassword
            error={errors.password}
          />

          <TouchableOpacity style={styles.forgotLink}>
            <Text
              style={[
                styles.forgotText,
                { color: colors.brandPurple, fontFamily: fontFamily.semiBold },
              ]}
            >
              Esqueceu a senha?
            </Text>
          </TouchableOpacity>

          <Button
            title="Entrar na Conta"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: spacing.sm }}
          />
        </View>

        {/* Divisor */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text
            style={[
              styles.dividerText,
              { color: colors.textMuted, fontFamily: fontFamily.semiBold },
            ]}
          >
            Ou
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Biometria */}
        <Button
          title="Entrar com Biometria"
          onPress={handleBiometricLogin}
          variant="outline"
          icon={
            <Ionicons name="finger-print" size={24} color={colors.brandPurple} />
          }
        />

        {/* Link para registo */}
        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              { color: colors.textMuted, fontFamily: fontFamily.medium },
            ]}
          >
            Não tem uma conta?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text
              style={[
                styles.footerLink,
                { color: colors.brandPurple, fontFamily: fontFamily.bold },
              ]}
            >
              Criar agora
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['5xl'],
    paddingBottom: spacing['3xl'],
  },
  glowEffect: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logo: {
    fontSize: 30,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.5,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  titleContainer: {
    marginBottom: spacing['4xl'],
  },
  title: {
    fontSize: fontSize['4xl'],
    lineHeight: 42,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.lg,
  },
  form: {
    gap: spacing.xl,
    marginBottom: spacing['3xl'],
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
  },
  forgotText: {
    fontSize: fontSize.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing['2xl'],
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: fontSize.sm,
    paddingHorizontal: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing['3xl'],
  },
  footerText: {
    fontSize: fontSize.md,
  },
  footerLink: {
    fontSize: fontSize.md,
  },
});

export default LoginScreen;
