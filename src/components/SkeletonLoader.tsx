/**
 * SkeletonLoader — Placeholder animado para loading
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, borderRadius } from '@/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadiusSize?: number;
  style?: ViewStyle;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadiusSize = borderRadius.md,
  style,
}) => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: borderRadiusSize,
          backgroundColor: colors.skeleton,
          opacity,
        },
        style,
      ]}
    />
  );
};

/**
 * Skeleton para item de transação
 */
export const TransactionSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        skeletonStyles.transactionItem,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={skeletonStyles.row}>
        <SkeletonLoader width={40} height={40} borderRadiusSize={20} />
        <View style={skeletonStyles.textGroup}>
          <SkeletonLoader width={140} height={14} />
          <SkeletonLoader width={100} height={12} style={{ marginTop: 6 }} />
        </View>
      </View>
      <SkeletonLoader width={80} height={14} />
    </View>
  );
};

/**
 * Skeleton para o BalanceCard
 */
export const BalanceSkeleton: React.FC = () => {
  return (
    <View style={skeletonStyles.balanceCard}>
      <SkeletonLoader width={120} height={14} />
      <SkeletonLoader width={200} height={36} style={{ marginTop: 8 }} />
      <SkeletonLoader width={100} height={28} style={{ marginTop: 16 }} />
    </View>
  );
};

const skeletonStyles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textGroup: {
    gap: 4,
  },
  balanceCard: {
    backgroundColor: 'rgba(135,44,203,0.2)',
    borderRadius: 32,
    padding: 24,
    marginBottom: 32,
  },
});

export default SkeletonLoader;
