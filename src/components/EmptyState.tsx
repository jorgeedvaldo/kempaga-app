/**
 * EmptyState — Componente para listas vazias
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, fontFamily, fontSize, spacing } from '@/theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'folder-open-outline',
  title,
  description,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.brandPurpleLight }]}>
        <Ionicons name={icon} size={40} color={colors.brandPurple} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
        {title}
      </Text>
      {description && (
        <Text style={[styles.description, { color: colors.textMuted, fontFamily: fontFamily.regular }]}>
          {description}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing['3xl'],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EmptyState;
