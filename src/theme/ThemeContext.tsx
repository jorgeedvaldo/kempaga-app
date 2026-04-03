/**
 * Kempaga Theme Context
 * Manages light/dark mode with AsyncStorage persistence
 * Default: light mode
 */

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, type ThemeColors } from './colors';

const THEME_STORAGE_KEY = '@kempaga_theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  colors: lightColors,
  isDark: false,
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  // Carrega tema salvo ao iniciar
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setMode(savedTheme);
        }
      } catch (error) {
        console.warn('Erro ao carregar tema:', error);
      }
    };
    loadTheme();
  }, []);

  // Alterna entre light e dark
  const toggleTheme = useCallback(async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.warn('Erro ao salvar tema:', error);
    }
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      colors: mode === 'dark' ? darkColors : lightColors,
      isDark: mode === 'dark',
      toggleTheme,
    }),
    [mode, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
