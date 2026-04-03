/**
 * TransactionItem — Linha de transação no histórico
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, fontFamily, fontSize, spacing, borderRadius } from '@/theme';
import { formatCurrency, formatDate } from '@/utils/helpers';
import type { Transaction } from '@/types';

interface TransactionItemProps {
  transaction: Transaction;
  currentUserId: number;
  onPress?: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  currentUserId,
  onPress,
}) => {
  const { colors } = useTheme();

  // Determinar se é entrada ou saída do ponto de vista do user atual
  const isSent = transaction.type === 'send';
  const isReceived = transaction.type === 'receive';

  // Ícone e cor com base no tipo
  const iconName = isSent ? 'arrow-up' : 'arrow-down';
  const iconColor = isSent ? colors.brandPurple : colors.brandGreen;
  const iconBgColor = isSent ? colors.brandPurpleLight : colors.brandGreenLight;
  const amountPrefix = isSent ? '- ' : '+ ';
  const amountColor = isSent ? colors.textPrimary : colors.brandGreen;

  // Nome do outro participante
  const otherPerson = isSent
    ? transaction.receiver
    : transaction.sender;
  const otherName = otherPerson
    ? `${otherPerson.first_name} ${otherPerson.last_name}`
    : 'Desconhecido';

  // Descrição baseada no tipo de transação
  const getDescription = () => {
    switch (transaction.transaction_type) {
      case 'transfer':
        return isSent ? 'Transferência Enviada' : 'Transferência Recebida';
      case 'deposit':
        return 'Depósito';
      case 'withdrawal':
        return 'Levantamento';
      case 'payment':
        return 'Pagamento';
      case 'request':
        return isSent ? 'Pedido Enviado' : 'Pedido Recebido';
      default:
        return 'Transação';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Ionicons
            name={iconName}
            size={20}
            color={iconColor}
            style={{
              transform: [{ rotate: isSent ? '45deg' : '-45deg' }],
            }}
          />
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: colors.textPrimary, fontFamily: fontFamily.semiBold },
            ]}
            numberOfLines={1}
          >
            {getDescription()}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: colors.textMuted, fontFamily: fontFamily.regular },
            ]}
            numberOfLines={1}
          >
            {otherName} • {formatDate(transaction.created_at)}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.amount,
          { color: amountColor, fontFamily: fontFamily.bold },
        ]}
      >
        {amountPrefix}{formatCurrency(transaction.amount)} AOA
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.md,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  amount: {
    fontSize: fontSize.md,
    marginLeft: spacing.sm,
  },
});

export default TransactionItem;
