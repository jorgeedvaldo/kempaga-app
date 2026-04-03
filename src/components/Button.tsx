/**
 * Button — Botão reutilizável com variantes
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme, fontFamily, fontSize, borderRadius, spacing } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const { colors } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.xl,
      gap: spacing.sm,
      width: fullWidth ? '100%' : undefined,
    };

    // Tamanho
    switch (size) {
      case 'sm':
        base.paddingVertical = spacing.sm;
        base.paddingHorizontal = spacing.lg;
        break;
      case 'md':
        base.paddingVertical = spacing.md;
        base.paddingHorizontal = spacing.xl;
        break;
      case 'lg':
        base.paddingVertical = spacing.lg;
        base.paddingHorizontal = spacing['2xl'];
        break;
    }

    // Variante
    switch (variant) {
      case 'primary':
        base.backgroundColor = colors.brandPurple;
        base.shadowColor = colors.brandPurple;
        base.shadowOffset = { width: 0, height: 4 };
        base.shadowOpacity = 0.25;
        base.shadowRadius = 12;
        base.elevation = 6;
        break;
      case 'secondary':
        base.backgroundColor = colors.brandGreen;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 2;
        base.borderColor = colors.borderStrong;
        break;
      case 'danger':
        base.backgroundColor = colors.danger;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
    }

    if (disabled || loading) {
      base.opacity = 0.6;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontFamily: fontFamily.bold,
      textAlign: 'center',
    };

    switch (size) {
      case 'sm':
        base.fontSize = fontSize.md;
        break;
      case 'md':
        base.fontSize = fontSize.lg;
        break;
      case 'lg':
        base.fontSize = fontSize.xl;
        break;
    }

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        base.color = '#ffffff';
        break;
      case 'outline':
        base.color = colors.textPrimary;
        break;
      case 'ghost':
        base.color = colors.brandPurple;
        break;
    }

    return base;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.brandPurple : '#ffffff'}
        />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
