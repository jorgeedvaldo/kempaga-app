/**
 * QuickActions — Ações rápidas do ecrã Home (Enviar, Receber)
 * "Pagar" e "Cripto" ficam ocultos por decisão do utilizador
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, fontFamily, fontSize, spacing, borderRadius } from '@/theme';

interface QuickActionsProps {
  onSend: () => void;
  onReceive: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onSend, onReceive }) => {
  const { colors } = useTheme();

  const actions = [
    {
      key: 'send',
      label: 'Enviar',
      icon: 'arrow-up' as const,
      color: colors.brandPurple,
      onPress: onSend,
      rotate: '45deg',
    },
    {
      key: 'receive',
      label: 'Receber',
      icon: 'arrow-down' as const,
      color: colors.brandGreen,
      onPress: onReceive,
      rotate: '-45deg',
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.key}
          style={[
            styles.button,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
          activeOpacity={0.7}
          onPress={action.onPress}
        >
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name={action.icon}
              size={24}
              color={action.color}
              style={{ transform: [{ rotate: action.rotate }] }}
            />
          </View>
          <Text
            style={[
              styles.label,
              {
                color: colors.textPrimary,
                fontFamily: fontFamily.semiBold,
              },
            ]}
          >
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['3xl'],
    marginBottom: spacing['3xl'],
  },
  button: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    fontSize: fontSize.xs,
  },
});

export default QuickActions;
