/**
 * TransactionDetailScreen — Detalhes de uma transação
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useTheme, fontFamily, fontSize, spacing, borderRadius } from '@/theme';
import { formatCurrency, formatDate } from '@/utils/helpers';
import Avatar from '@/components/Avatar';
import type { Transaction } from '@/types';

const TransactionDetailScreen: React.FC = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  // Usar a transação enviada por parâmetros para ser instantâneo e evitar erros de API "Nao encontrada"
  const transaction: Transaction = route.params?.transaction;

  if (!transaction) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted, fontFamily: fontFamily.medium }}>
          Transação não encontrada
        </Text>
      </View>
    );
  }

  const isSent = transaction.type === 'send';
  const otherPerson = isSent ? transaction.receiver : transaction.sender;
  const otherName = otherPerson
    ? `${otherPerson.first_name} ${otherPerson.last_name}`
    : 'Desconhecido';

  const statusConfig = {
    completed: { label: 'Concluída', color: colors.brandGreen, icon: 'checkmark-circle' as const },
    pending: { label: 'Pendente', color: colors.warning, icon: 'time' as const },
    failed: { label: 'Falhada', color: colors.danger, icon: 'close-circle' as const },
    cancelled: { label: 'Cancelada', color: colors.textMuted, icon: 'ban' as const },
  };

  const status = statusConfig[transaction.status] || statusConfig.pending;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderColor: colors.border, paddingTop: Math.max(insets.top, spacing['5xl']) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
          Detalhes
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, spacing['6xl']) }]} showsVerticalScrollIndicator={false}>
        {/* Ícone de status */}
        <View style={styles.statusSection}>
          <View style={[styles.statusIconContainer, { backgroundColor: status.color + '20' }]}>
            <Ionicons name={status.icon} size={40} color={status.color} />
          </View>
          <Text style={[styles.statusLabel, { color: status.color, fontFamily: fontFamily.semiBold }]}>
            {status.label}
          </Text>
          <Text style={[styles.bigAmount, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
            {isSent ? '- ' : '+ '}{formatCurrency(transaction.amount)}
            <Text style={[styles.bigCurrency, { fontFamily: fontFamily.bold }]}> AOA</Text>
          </Text>
        </View>

        {/* Detalhes */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* De / Para */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
              {isSent ? 'Enviado para' : 'Recebido de'}
            </Text>
            <View style={styles.detailUserRow}>
              <Avatar imageUrl={otherPerson?.image_url} name={otherName} size={32} showBorder={false} />
              <Text style={[styles.detailValue, { color: colors.textPrimary, fontFamily: fontFamily.semiBold }]}>
                {otherName}
              </Text>
            </View>
          </View>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          {/* ID da transação */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
              ID da Transação
            </Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary, fontFamily: fontFamily.semiBold }]}>
              {transaction.trx_id}
            </Text>
          </View>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          {/* Data */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
              Data
            </Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary, fontFamily: fontFamily.semiBold }]}>
              {formatDate(transaction.created_at)}
            </Text>
          </View>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          {/* Tipo */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
              Tipo
            </Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary, fontFamily: fontFamily.semiBold }]}>
              {transaction.transaction_type === 'transfer' ? 'Transferência' : transaction.transaction_type}
            </Text>
          </View>

          {transaction.note && (
            <>
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
                  Nota
                </Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary, fontFamily: fontFamily.regular }]}>
                  {transaction.note}
                </Text>
              </View>
            </>
          )}

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          {/* Saldo após */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
              Saldo após transação
            </Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary, fontFamily: fontFamily.semiBold }]}>
              {formatCurrency(transaction.balance_after)} AOA
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['5xl'],
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: fontSize.xl },
  content: {
    padding: spacing['2xl'],
    paddingBottom: spacing['6xl'],
  },
  statusSection: { alignItems: 'center', marginBottom: spacing['3xl'] },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  statusLabel: { fontSize: fontSize.lg, marginBottom: spacing.sm },
  bigAmount: { fontSize: 36 },
  bigCurrency: { fontSize: fontSize['2xl'] },
  detailsCard: {
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    padding: spacing.xl,
  },
  detailRow: { paddingVertical: spacing.md },
  detailLabel: { fontSize: fontSize.sm, marginBottom: spacing.xs },
  detailValue: { fontSize: fontSize.lg },
  detailUserRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  separator: { height: 1 },
});

export default TransactionDetailScreen;
