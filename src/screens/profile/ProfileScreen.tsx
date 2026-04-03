/**
 * ProfileScreen — Ecrã de perfil do utilizador
 * Segue o design do mockup HTML (tab Perfil)
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { useTheme, fontFamily, fontSize, spacing, borderRadius } from '@/theme';
import Avatar from '@/components/Avatar';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { colors, toggleTheme, isDark } = useTheme();
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    Alert.alert('Terminar Sessão', 'Tem certeza que quer sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const menuItems = [
    {
      key: 'theme',
      icon: isDark ? 'moon' : 'sunny',
      iconColor: isDark ? '#fbbf24' : '#f59e0b',
      iconBg: isDark ? colors.card : '#fef3c7',
      label: isDark ? 'Modo Escuro' : 'Modo Claro',
      isToggle: true,
      onPress: toggleTheme,
    },
    {
      key: 'personal',
      icon: 'person-outline',
      iconColor: colors.textSecondary,
      iconBg: isDark ? colors.card : '#f1f5f9',
      label: 'Dados Pessoais',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      key: 'security',
      icon: 'shield-checkmark-outline',
      iconColor: colors.textSecondary,
      iconBg: isDark ? colors.card : '#f1f5f9',
      label: 'Segurança',
      onPress: () => {},
    },
    {
      key: 'help',
      icon: 'help-circle-outline',
      iconColor: colors.textSecondary,
      iconBg: isDark ? colors.card : '#f1f5f9',
      label: 'Ajuda & Suporte',
      onPress: () => {},
    },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Título */}
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
          Meu Perfil
        </Text>

        {/* Foto + Info do User */}
        <View style={styles.profileSection}>
          <Avatar
            imageUrl={user?.image_url}
            name={user?.full_name || 'User'}
            size={96}
            showBorder
          />
          <Text style={[styles.userName, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
            {user?.full_name || 'Utilizador'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textMuted, fontFamily: fontFamily.regular }]}>
            {user?.email}
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: item.iconBg },
                  ]}
                >
                  <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                </View>
                <Text
                  style={[
                    styles.menuLabel,
                    { color: colors.textPrimary, fontFamily: fontFamily.semiBold },
                  ]}
                >
                  {item.label}
                </Text>
              </View>

              {item.isToggle ? (
                // Toggle visual
                <View
                  style={[
                    styles.toggle,
                    {
                      backgroundColor: isDark ? colors.brandPurple : '#e2e8f0',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleDot,
                      { transform: [{ translateX: isDark ? 20 : 0 }] },
                    ]}
                  />
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Botão Logout */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.menuIconContainer,
              { backgroundColor: colors.dangerLight },
            ]}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          </View>
          <Text
            style={[
              styles.logoutText,
              { color: colors.danger, fontFamily: fontFamily.semiBold },
            ]}
          >
            Terminar Sessão
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.version, { color: colors.textMuted, fontFamily: fontFamily.regular }]}>
          Kempaga v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['5xl'],
    paddingBottom: spacing['6xl'],
  },
  title: { fontSize: fontSize['3xl'], marginBottom: spacing['2xl'] },
  profileSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  userName: { fontSize: fontSize['2xl'], marginTop: spacing.md },
  userEmail: { fontSize: fontSize.md, marginTop: spacing.xs },
  menuSection: { gap: spacing.md, marginBottom: spacing['2xl'] },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: fontSize.lg },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    gap: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  logoutText: { fontSize: fontSize.lg },
  version: { textAlign: 'center', fontSize: fontSize.sm },
});

export default ProfileScreen;
