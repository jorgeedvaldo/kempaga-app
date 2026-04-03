/**
 * AppNavigator — Root navigator
 * Alterna entre AuthNavigator e MainNavigator com base no estado de autenticação
 */

import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { useTheme, fontFamily } from '@/theme';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors, isDark } = useTheme();

  // Temas customizados para o NavigationContainer
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.brandPurple,
      background: colors.background,
      card: colors.card,
      text: colors.textPrimary,
      border: colors.border,
    },
  };

  // Ecrã de carregamento inicial (hidratar sessão)
  if (isLoading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: '#08050e' }]}>
        {/* Efeitos de brilho (como no splash screen HTML) */}
        <View style={[styles.glow, styles.glowTop]} />
        <View style={[styles.glow, styles.glowBottom]} />

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoK}>K</Text>
            <Text style={styles.logoP}>p</Text>
          </View>
          <Text style={styles.logoText}>
            <Text style={{ color: '#872ccb' }}>Kem</Text>
            <Text style={{ color: '#107123' }}>paga</Text>
          </Text>
          <Text style={styles.tagline}>A sua liberdade financeira</Text>
        </View>

        {/* Spinner */}
        <View style={styles.spinnerSection}>
          <ActivityIndicator size="small" color="#872ccb" />
          <Text style={styles.loadingText}>A carregar ambiente seguro...</Text>
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 256,
    height: 256,
    borderRadius: 128,
    opacity: 0.3,
  },
  glowTop: {
    top: '20%',
    backgroundColor: '#872ccb',
    transform: [{ scale: 1.5 }],
  },
  glowBottom: {
    bottom: '20%',
    backgroundColor: '#107123',
    transform: [{ scale: 1.5 }],
    opacity: 0.2,
  },
  logoContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 24,
  },
  logoK: {
    fontSize: 32,
    fontFamily: fontFamily.bold,
    color: '#872ccb',
  },
  logoP: {
    fontSize: 32,
    fontFamily: fontFamily.bold,
    color: '#107123',
  },
  logoText: {
    fontSize: 42,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.5,
  },
  tagline: {
    color: '#6b7280',
    fontFamily: fontFamily.medium,
    fontSize: 14,
    marginTop: 16,
    letterSpacing: 0.5,
  },
  spinnerSection: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#6b7280',
    fontFamily: fontFamily.medium,
    fontSize: 12,
  },
});

export default AppNavigator;
