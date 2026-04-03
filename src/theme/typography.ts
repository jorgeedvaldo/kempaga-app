/**
 * Kempaga Design System — Typography
 * Uses the 'Fredoka' font family across the app
 */

export const fontFamily = {
  light: 'Fredoka_300Light',
  regular: 'Fredoka_400Regular',
  medium: 'Fredoka_500Medium',
  semiBold: 'Fredoka_600SemiBold',
  bold: 'Fredoka_700Bold',
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
} as const;

export const lineHeight = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
} as const;
