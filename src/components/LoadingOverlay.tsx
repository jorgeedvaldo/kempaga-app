/**
 * LoadingOverlay — Ecrã de loading sobre todo o conteúdo
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { useTheme, fontFamily, fontSize, spacing } from '@/theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'A processar...',
}) => {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          <ActivityIndicator size="large" color={colors.brandPurple} />
          <Text
            style={[
              styles.message,
              { color: colors.textPrimary, fontFamily: fontFamily.medium },
            ]}
          >
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: spacing['3xl'],
    borderRadius: 24,
    alignItems: 'center',
    gap: spacing.lg,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  message: {
    fontSize: fontSize.lg,
    textAlign: 'center',
  },
});

export default LoadingOverlay;
