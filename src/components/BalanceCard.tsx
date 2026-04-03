/**
 * BalanceCard — Cartão de saldo com gradiente roxo→verde
 * Replica exatamente o design do mockup HTML
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fontFamily, fontSize, spacing, borderRadius } from '@/theme';
import { formatCurrency } from '@/utils/helpers';

interface BalanceCardProps {
  balance: string;
  currency?: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  currency = 'AOA',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <LinearGradient
      colors={['#872ccb', '#107123']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Efeito de brilho circular de fundo */}
      <View style={styles.glowEffect} />

      {/* Header: "Saldo Disponível" + botão olho */}
      <View style={styles.header}>
        <Text style={styles.label}>Saldo Disponível</Text>
        <TouchableOpacity
          onPress={() => setIsVisible(!isVisible)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.eyeButton}
        >
          <Ionicons
            name={isVisible ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color="rgba(255,255,255,0.8)"
          />
        </TouchableOpacity>
      </View>

      {/* Valor do saldo */}
      <Text style={styles.amount}>
        {isVisible ? formatCurrency(balance) : '••••••••'}{' '}
        <Text style={styles.currency}>{currency}</Text>
      </Text>

      {/* IBAN snipper */}
      <View style={styles.ibanContainer}>
        <View style={styles.ibanBadge}>
          <Ionicons name="card-outline" size={14} color="#ffffff" />
          <Text style={styles.ibanText}>Carteira Digital</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius['2xl'] + 8, // ~32
    padding: spacing['2xl'],
    marginBottom: spacing['3xl'],
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#872ccb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glowEffect: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    zIndex: 10,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
  },
  eyeButton: {
    opacity: 0.8,
  },
  amount: {
    fontFamily: fontFamily.bold,
    fontSize: 34,
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: spacing.lg,
    zIndex: 10,
  },
  currency: {
    fontSize: fontSize['2xl'],
    fontFamily: fontFamily.bold,
  },
  ibanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  ibanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  ibanText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: '#ffffff',
  },
});

export default BalanceCard;
