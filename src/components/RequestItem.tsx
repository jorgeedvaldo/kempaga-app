/**
 * RequestItem — Linha de pedido de dinheiro (apenas exibição, ações na página de detalhes)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, fontFamily, fontSize, spacing, borderRadius } from '@/theme';
import { formatCurrency, formatDate } from '@/utils/helpers';
import type { MoneyRequest } from '@/types';
import Avatar from './Avatar';

interface RequestItemProps {
  request: MoneyRequest;
  currentUserId: number;
  onPress?: () => void;
}

const RequestItem: React.FC<RequestItemProps> = ({
  request,
  currentUserId,
  onPress,
}) => {
  const { colors } = useTheme();

  // sender = quem pediu, receiver = quem deve pagar
  const iAmReceiver = request.receiver_id === currentUserId;
  const otherPerson = request.sender?.id === currentUserId ? request.receiver : request.sender;
  const otherName = otherPerson
    ? `${otherPerson.first_name} ${otherPerson.last_name}`
    : 'Desconhecido';

  const isPending = request.status === 'pending';

  const getStatusLabel = () => {
    switch (request.status) {
      case 'pending': return 'Pendente';
      case 'accepted': return 'Aceite';
      case 'rejected': return 'Rejeitado';
      case 'cancelled': return 'Cancelado';
      default: return request.status;
    }
  };

  const getStatusColor = () => {
    switch (request.status) {
      case 'pending': return colors.warning;
      case 'accepted': return colors.brandGreen;
      case 'rejected': return colors.danger;
      case 'cancelled': return colors.textMuted;
      default: return colors.textMuted;
    }
  };

  const getDirectionLabel = () => {
    if (iAmReceiver) {
      return 'Pedido recebido';
    }
    return 'Pedido enviado';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.userInfo}>
          <Avatar
            imageUrl={otherPerson?.image_url}
            name={otherName}
            size={40}
            showBorder={false}
          />
          <View style={styles.textContainer}>
            <Text
              style={[styles.name, { color: colors.textPrimary, fontFamily: fontFamily.semiBold }]}
              numberOfLines={1}
            >
              {otherName}
            </Text>
            <Text
              style={[styles.date, { color: colors.textMuted, fontFamily: fontFamily.regular }]}
            >
              {formatDate(request.created_at)} · {getDirectionLabel()}
            </Text>
          </View>
        </View>

        <View style={styles.amountSection}>
          <Text style={[styles.amount, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
            {formatCurrency(request.amount)} AOA
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(), fontFamily: fontFamily.medium }]}>
              {getStatusLabel()}
            </Text>
          </View>
        </View>
      </View>

      {request.note ? (
        <Text
          style={[styles.note, { color: colors.textMuted, fontFamily: fontFamily.regular }]}
          numberOfLines={2}
        >
          "{request.note}"
        </Text>
      ) : null}

      {/* Botão Ver Detalhes */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.detailsLink}>
          <Text style={[styles.detailsText, { color: colors.brandPurple, fontFamily: fontFamily.semiBold }]}>
            Ver Detalhes
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.brandPurple} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.md,
  },
  date: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  amountSection: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  amount: {
    fontSize: fontSize.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
  },
  note: {
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    marginTop: spacing.md,
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  detailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailsText: {
    fontSize: fontSize.sm,
  },
});

export default RequestItem;
