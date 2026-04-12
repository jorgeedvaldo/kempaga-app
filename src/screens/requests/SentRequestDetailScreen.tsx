import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, fontFamily, fontSize, spacing, borderRadius } from '@/theme';
import { requestService } from '@/services/requestService';
import { formatCurrency, formatDate, getErrorMessage } from '@/utils/helpers';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import type { MoneyRequest } from '@/types';

const SentRequestDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const request: MoneyRequest = route.params?.request;
  const [loading, setLoading] = useState(false);

  if (!request) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted, fontFamily: fontFamily.medium }}>
          Pedido não encontrado
        </Text>
      </View>
    );
  }

  // Como é enviado, a "outra pessoa" é quem recebeu o pedido (destinatário = quem deve pagar)
  const otherPerson = request.receiver;
  const otherName = otherPerson
    ? `${otherPerson.first_name} ${otherPerson.last_name}`
    : 'Desconhecido';

  const isPending = request.status === 'pending';

  const handleCancel = () => {
    Alert.alert('Cancelar Pedido', `Tem a certeza que quer cancelar o seu pedido de pagamento a ${otherName}?`, [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim, Cancelar',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await requestService.cancelRequest(request.id);
            Alert.alert('Sucesso', 'O pedido foi cancelado.', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          } catch (error) {
            Alert.alert('Erro', getErrorMessage(error));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const getStatusLabel = () => {
    switch (request.status) {
      case 'pending': return 'Aguardando Pagamento...';
      case 'accepted': return 'Recebeu com Sucesso';
      case 'rejected': return 'Rejeitado pelo Destinatário';
      case 'cancelled': return 'Cancelado (Por Si)';
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

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderColor: colors.border, paddingTop: Math.max(insets.top, spacing['5xl']) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
          Dados do Pedido Enviado
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, spacing['2xl']) }]}>
        <View style={styles.card}>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
            Informações do Destinatário
          </Text>

          <View style={styles.userSection}>
            <Avatar
              imageUrl={otherPerson?.image_url}
              name={otherName}
              size={80}
              showBorder={false}
            />
            <Text style={[styles.userName, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
              {otherName}
            </Text>
            {otherPerson?.phone ? (
              <Text style={[styles.userPhone, { color: colors.textMuted, fontFamily: fontFamily.regular }]}>
                {otherPerson.phone}
              </Text>
            ) : null}
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
              Valor que Solicitou
            </Text>
            <Text style={[styles.amount, { color: colors.brandPurple, fontFamily: fontFamily.bold }]}>
              {formatCurrency(request.amount)} AOA
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
              Resposta do {otherPerson?.first_name || 'Alvo'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(), fontFamily: fontFamily.semiBold }]}>
                {getStatusLabel()}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
              Enviado em
            </Text>
            <Text style={[styles.value, { color: colors.textPrimary, fontFamily: fontFamily.regular }]}>
              {formatDate(request.created_at)}
            </Text>
          </View>

          {request.note ? (
            <View style={styles.noteSection}>
              <Text style={[styles.label, { 
                color: request.status === 'rejected' ? colors.danger : colors.textMuted, 
                fontFamily: fontFamily.medium, 
                marginBottom: 8 
              }]}>
                {request.status === 'rejected' 
                  ? `Nota de Rejeição de ${otherPerson?.first_name || 'Pessoa'}`
                  : 'A sua Justificação'}
              </Text>
              <View style={[styles.noteBox, { 
                backgroundColor: request.status === 'rejected' ? colors.dangerLight : colors.card, 
                borderColor: request.status === 'rejected' ? colors.danger + '40' : colors.border 
              }]}>
                <Text style={{ 
                  color: request.status === 'rejected' ? colors.danger : colors.textPrimary, 
                  fontFamily: fontFamily.regular, 
                  fontSize: fontSize.md 
                }}>
                  "{request.note}"
                </Text>
              </View>
            </View>
          ) : null}

          {/* Acções Pendentes Exclusivas de Quem Pediu */}
          {isPending && (
            <View style={styles.actionContainer}>
              {loading ? (
                <ActivityIndicator size="large" color={colors.brandPurple} />
              ) : (
                <Button 
                  title="Cancelar/Revogar Pedido" 
                  onPress={handleCancel}
                  variant="ghost"
                  icon="trash-outline"
                />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: fontSize.xl },
  headerSubtitle: { textAlign: 'center', marginBottom: spacing.lg },
  content: { padding: spacing['2xl'] },
  card: { paddingTop: spacing.xl },
  userSection: { alignItems: 'center', marginBottom: spacing['3xl'] },
  userName: { fontSize: fontSize['2xl'], marginTop: spacing.md },
  userPhone: { fontSize: fontSize.md, marginTop: spacing.xs },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  label: { fontSize: fontSize.md },
  amount: { fontSize: fontSize['2xl'] },
  value: { fontSize: fontSize.md },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  statusText: { fontSize: fontSize.sm },
  noteSection: { marginTop: spacing.xl },
  noteBox: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  actionContainer: { marginTop: spacing['4xl'] },
});

export default SentRequestDetailScreen;
