/**
 * Kempaga Design System — Color Tokens
 * Extracted from the brand HTML mockups
 * Supports light and dark themes
 */

export const palette = {
  // Brand Colors
  brandPurple: '#872ccb',
  brandPurpleHover: '#6a1d9e',
  brandPurpleLight: 'rgba(135, 44, 203, 0.1)',
  brandGreen: '#107123',
  brandGreenBright: '#24a13f',
  brandGreenLight: 'rgba(16, 113, 35, 0.1)',

  // Neutrals
  white: '#ffffff',
  black: '#000000',

  // Semantic
  danger: '#ef4444',
  dangerLight: 'rgba(239, 68, 68, 0.1)',
  warning: '#f59e0b',
  success: '#22c55e',
};

export const lightColors = {
  ...palette,
  background: '#f4f6f8',
  card: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
  border: '#f1f5f9',
  borderStrong: '#e2e8f0',
  inputBackground: '#ffffff',
  tabBarBackground: 'rgba(255, 255, 255, 0.8)',
  skeleton: '#e2e8f0',
  skeletonHighlight: '#f1f5f9',
  statusBar: 'dark' as 'dark' | 'light',
};

export const darkColors: ThemeColors = {
  ...palette,
  background: '#08050e',
  card: '#15111f',
  textPrimary: '#ffffff',
  textSecondary: '#d1d5db',
  textMuted: '#a3a3a3',
  border: 'rgba(31, 41, 55, 0.5)',
  borderStrong: '#374151',
  inputBackground: '#15111f',
  tabBarBackground: 'rgba(21, 17, 31, 0.9)',
  skeleton: '#1e1b2e',
  skeletonHighlight: '#2a2640',
  statusBar: 'light',
};

export type ThemeColors = typeof lightColors;
