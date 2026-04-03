/**
 * Kempaga Design System — Barrel Export
 */

import { useContext } from 'react';
import { ThemeContext, ThemeProvider } from './ThemeContext';

export { ThemeProvider } from './ThemeContext';
export { lightColors, darkColors, palette } from './colors';
export type { ThemeColors } from './colors';
export { spacing, borderRadius } from './spacing';
export { fontFamily, fontSize, lineHeight } from './typography';

/**
 * Hook para aceder ao tema atual
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};
