/**
 * EditProfileScreen — Editar dados pessoais do utilizador
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useTheme, fontFamily, fontSize, spacing, borderRadius } from '@/theme';
import { userService } from '@/services/userService';
import { getErrorMessage } from '@/utils/helpers';
import Avatar from '@/components/Avatar';
import Input from '@/components/Input';
import Button from '@/components/Button';

const EditProfileScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [biNumber, setBiNumber] = useState(user?.bi_number || '');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria.');
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
      // Upload da imagem imediatamente
      try {
        const formData = new FormData();
        const filename = result.assets[0].uri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('image', {
          uri: result.assets[0].uri,
          name: filename,
          type,
        } as any);
        await userService.uploadProfileImage(formData);
        await refreshUser();
        Alert.alert('Sucesso', 'Foto atualizada com sucesso!');
      } catch (error) {
        Alert.alert('Erro', getErrorMessage(error));
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('first_name', firstName.trim());
      formData.append('last_name', lastName.trim());
      formData.append('phone', phone.trim());
      formData.append('bi_number', biNumber.trim());

      await userService.updateProfile(formData);
      await refreshUser();
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Erro', getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderColor: colors.border, paddingTop: Math.max(insets.top, spacing['5xl']) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
          Dados Pessoais
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar editável */}
          <TouchableOpacity style={styles.avatarSection} onPress={pickImage}>
            <Avatar
              imageUrl={imageUri || user?.image_url}
              name={user?.full_name || 'User'}
              size={96}
              showBorder
            />
            <View
              style={[
                styles.cameraButton,
                { backgroundColor: colors.brandPurple },
              ]}
            >
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Email (não editável) */}
          <View style={[styles.readonlyField, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
            <View>
              <Text style={[styles.readonlyLabel, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
                Email
              </Text>
              <Text style={[styles.readonlyValue, { color: colors.textPrimary, fontFamily: fontFamily.semiBold }]}>
                {user?.email}
              </Text>
            </View>
          </View>

          {/* Campos editáveis */}
          <View style={styles.form}>
            <Input
              label="Primeiro Nome"
              icon="person-outline"
              value={firstName}
              onChangeText={setFirstName}
            />
            <Input
              label="Apelido"
              icon="person-outline"
              value={lastName}
              onChangeText={setLastName}
            />
            <Input
              label="Telefone"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Input
              label="Nº do BI"
              icon="card-outline"
              value={biNumber}
              onChangeText={setBiNumber}
              autoCapitalize="characters"
            />
          </View>

          <Button
            title="Guardar Alterações"
            onPress={handleSave}
            loading={saving}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['5xl'],
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: fontSize.xl },
  content: {
    padding: spacing['2xl'],
    paddingBottom: spacing['5xl'],
  },
  avatarSection: {
    alignSelf: 'center',
    marginBottom: spacing['2xl'],
    position: 'relative',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  readonlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.xl,
    opacity: 0.7,
  },
  readonlyLabel: { fontSize: fontSize.sm },
  readonlyValue: { fontSize: fontSize.lg },
  form: { gap: spacing.lg, marginBottom: spacing['2xl'] },
});

export default EditProfileScreen;
