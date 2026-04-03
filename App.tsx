/**
 * Kempaga App — Entry Point
 * Carrega fontes, providers e navegação
 */

import React, { useCallback } from 'react';
import { StatusBar, View, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Fredoka_300Light,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';

import { ThemeProvider, useTheme } from '@/theme';
import { AuthProvider } from '@/context/AuthContext';
import AppNavigator from '@/navigation/AppNavigator';

// Ignorar warnings de log desnecessários em dev
LogBox.ignoreLogs(['Non-serializable values were found']);

// Prevenir que o splash screen desapareça antes de carregar as fontes
SplashScreen.preventAutoHideAsync();

/**
 * Inner component que usa o tema para a StatusBar
 */
const AppContent: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <AppNavigator />
    </>
  );
};

/**
 * Root App component
 */
export default function App() {
  const [fontsLoaded] = useFonts({
    Fredoka_300Light,
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </View>
    </SafeAreaProvider>
  );
}
