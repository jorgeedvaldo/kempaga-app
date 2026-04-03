/**
 * Input — Campo de texto estilizado com ícone
 * Segue o design do mockup HTML (ícone à esquerda, bordas arredondadas)
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, fontFamily, fontSize, borderRadius, spacing } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  isPassword = false,
  containerStyle,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: colors.textSecondary,
              fontFamily: fontFamily.medium,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error
              ? colors.danger
              : isFocused
              ? colors.brandPurple
              : colors.border,
            borderWidth: isFocused ? 2 : 1,
          },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? colors.danger : isFocused ? colors.brandPurple : colors.textMuted}
            style={styles.icon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              fontFamily: fontFamily.medium,
            },
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={showPassword ? colors.brandPurple : colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text
          style={[
            styles.error,
            { color: colors.danger, fontFamily: fontFamily.medium },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  icon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: fontSize.lg,
    paddingVertical: spacing.lg,
  },
  eyeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  error: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});

export default Input;
