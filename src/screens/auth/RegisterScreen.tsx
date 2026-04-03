/**
 * RegisterScreen — Ecrã de criação de conta
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
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { useTheme, fontFamily, fontSize, spacing } from '@/theme';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Avatar from '@/components/Avatar';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

interface RegisterScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
}

interface FormState {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bi_number: string;
  password: string;
  password_confirmation: string;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { register } = useAuth();
  const { colors, toggleTheme, isDark } = useTheme();

  const [form, setForm] = useState<FormState>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bi_number: '',
    password: '',
    password_confirmation: '',
  });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.first_name.trim()) newErrors.first_name = 'Nome é obrigatório';
    if (!form.last_name.trim()) newErrors.last_name = 'Apelido é obrigatório';
    if (!form.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!form.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!form.bi_number.trim()) newErrors.bi_number = 'Nº do BI é obrigatório';
    if (!form.password) newErrors.password = 'Password é obrigatória';
    else if (form.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (form.password !== form.password_confirmation) {
      newErrors.password_confirmation = 'As passwords não coincidem';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para selecionar uma foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('first_name', form.first_name.trim());
      formData.append('last_name', form.last_name.trim());
      formData.append('email', form.email.trim());
      formData.append('phone', form.phone.trim());
      formData.append('bi_number', form.bi_number.trim());
      formData.append('password', form.password);
      formData.append('password_confirmation', form.password_confirmation);
      formData.append('type', 'customer');

      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('image', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      await register(formData);
    } catch (error: any) {
      Alert.alert('Erro no Registo', error.message);
    } finally {
      setLoading(false);
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
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

        {/* Título */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
            Criar Conta 🚀
          </Text>
          <Text
            style={[styles.subtitle, { color: colors.textMuted, fontFamily: fontFamily.medium }]}
          >
            Junte-se à revolução financeira.
          </Text>
        </View>

        {/* Foto de perfil */}
        <TouchableOpacity style={styles.avatarPicker} onPress={pickImage}>
          {imageUri ? (
            <Avatar imageUrl={imageUri} name="User" size={80} showBorder />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: colors.brandPurpleLight, borderColor: colors.border },
              ]}
            >
              <Ionicons name="camera" size={28} color={colors.brandPurple} />
              <Text
                style={[
                  styles.avatarText,
                  { color: colors.brandPurple, fontFamily: fontFamily.medium },
                ]}
              >
                Foto
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Formulário */}
        <View style={styles.form}>
          <View style={styles.row}>
            <Input
              icon="person-outline"
              placeholder="Primeiro Nome"
              value={form.first_name}
              onChangeText={(v) => updateField('first_name', v)}
              error={errors.first_name}
              containerStyle={styles.halfInput}
            />
            <Input
              icon="person-outline"
              placeholder="Apelido"
              value={form.last_name}
              onChangeText={(v) => updateField('last_name', v)}
              error={errors.last_name}
              containerStyle={styles.halfInput}
            />
          </View>

          <Input
            icon="mail-outline"
            placeholder="Email"
            value={form.email}
            onChangeText={(v) => updateField('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            icon="call-outline"
            placeholder="Telefone (+244...)"
            value={form.phone}
            onChangeText={(v) => updateField('phone', v)}
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <Input
            icon="card-outline"
            placeholder="Nº do BI"
            value={form.bi_number}
            onChangeText={(v) => updateField('bi_number', v)}
            autoCapitalize="characters"
            error={errors.bi_number}
          />

          <Input
            icon="lock-closed-outline"
            placeholder="Palavra-passe"
            value={form.password}
            onChangeText={(v) => updateField('password', v)}
            isPassword
            error={errors.password}
          />

          <Input
            icon="lock-closed-outline"
            placeholder="Confirmar Palavra-passe"
            value={form.password_confirmation}
            onChangeText={(v) => updateField('password_confirmation', v)}
            isPassword
            error={errors.password_confirmation}
          />

          <Button
            title="Criar Conta"
            onPress={handleRegister}
            loading={loading}
            variant="primary"
            style={{ marginTop: spacing.md }}
          />
        </View>

        {/* Link para login */}
        <View style={styles.footer}>
          <Text
            style={[styles.footerText, { color: colors.textMuted, fontFamily: fontFamily.medium }]}
          >
            Já tem uma conta?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text
              style={[
                styles.footerLink,
                { color: colors.brandPurple, fontFamily: fontFamily.bold },
              ]}
            >
              Entrar
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 24,
    fontFamily: fontFamily.bold,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  titleContainer: {
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: fontSize['3xl'],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.lg,
  },
  avatarPicker: {
    alignSelf: 'center',
    marginBottom: spacing['2xl'],
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  avatarText: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  form: {
    gap: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.md,
  },
  footerLink: {
    fontSize: fontSize.md,
  },
});

export default RegisterScreen;
