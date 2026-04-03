import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useTheme, fontFamily, fontSize, spacing, borderRadius } from '@/theme';
import { requestService } from '@/services/requestService';
import { formatCurrency, formatDate, getErrorMessage } from '@/utils/helpers';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import type { MoneyRequest } from '@/types';

const ReceivedRequestDetailScreen: React.FC = () => {
  const { refreshUser } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const request: MoneyRequest = route.params?.request;
  const [loading, setLoading] = useState(false);
  
  // Modal de rejeição
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  if (!request) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted, fontFamily: fontFamily.medium }}>
          Pedido não encontrado
        </Text>
      </View>
    );
  }

  // Como é recebido, a "outra pessoa" é quem enviou o pedido (remetente = quem quer dinheiro)
  const otherPerson = request.sender;
  const otherName = otherPerson
    ? `${otherPerson.first_name} ${otherPerson.last_name}`
    : 'Desconhecido';

  const isPending = request.status === 'pending';

  const handleAccept = async () => {
    Alert.alert('Aceitar Pedido', `Deseja transferir ${formatCurrency(request.amount)} AOA para ${otherName} agora?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim, Pagar',
        onPress: async () => {
          setLoading(true);
          try {
            await requestService.respondRequest(request.id, 'accepted');
            await refreshUser();
            Alert.alert('Sucesso', 'Pedido aceite e transferência realizada!', [
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

  const confirmReject = async () => {
    setRejectModalVisible(false);
    setLoading(true);
    try {
      await requestService.respondRequest(request.id, 'rejected', rejectNote || undefined);
      Alert.alert('Sucesso', 'O pedido foi rejeitado.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Erro', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = () => {
    switch (request.status) {
      case 'pending': return 'Pendente';
      case 'accepted': return 'Pago';
      case 'rejected': return 'Rejeitado por Mim';
      case 'cancelled': return 'Cancelado (Pela pessoa)';
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
          Detalhes de Pagamento
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
            Informações do Solicitante
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
              Montante Solicitado
            </Text>
            <Text style={[styles.amount, { color: colors.brandPurple, fontFamily: fontFamily.bold }]}>
              {formatCurrency(request.amount)} AOA
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
              Estado Atual
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(), fontFamily: fontFamily.semiBold }]}>
                {getStatusLabel()}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
              Data do Pedido
            </Text>
            <Text style={[styles.value, { color: colors.textPrimary, fontFamily: fontFamily.regular }]}>
              {formatDate(request.created_at)}
            </Text>
          </View>

          {request.note ? (
            <View style={styles.noteSection}>
              <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamily.medium, marginBottom: 8 }]}>
                {request.status === 'rejected' ? 'Sua Nota de Rejeição' : 'Justificação do Solicitante'}
              </Text>
              <View style={[styles.noteBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.regular, fontSize: fontSize.md }}>
                  "{request.note}"
                </Text>
              </View>
            </View>
          ) : null}

          {/* Acções Pendentes Exclusivas do Recebedor */}
          {isPending && (
            <View style={styles.actionContainer}>
              {loading ? (
                <ActivityIndicator size="large" color={colors.brandPurple} />
              ) : (
                <>
                  <Button 
                    title="Aceitar e Pagar" 
                    onPress={handleAccept} 
                    icon="checkmark-circle-outline"
                    style={{ marginBottom: spacing.md }}
                  />
                  <Button 
                    title="Rejeitar Pedido" 
                    onPress={() => setRejectModalVisible(true)}
                    variant="danger"
                    icon="close-circle-outline"
                  />
                </>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Modal Rejeição */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setRejectModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
              Motivo da Rejeição
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted, fontFamily: fontFamily.regular }]}>
              Indique por que razão não quer responder a este pedido (opcional).
            </Text>
            
            <TextInput
              style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.border, fontFamily: fontFamily.medium }]}
              placeholder="Ex: Já não te devo dinheiro..."
              placeholderTextColor={colors.textMuted}
              value={rejectNote}
              onChangeText={setRejectNote}
              multiline
            />
            
            <View style={styles.modalActions}>
              <Button 
                title="Voltar" 
                variant="ghost" 
                onPress={() => setRejectModalVisible(false)} 
                fullWidth={false}
                style={{ flex: 1 }}
              />
              <Button 
                title="Confirmar" 
                variant="danger" 
                onPress={confirmReject} 
                fullWidth={false}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  modalContent: {
    width: '100%',
    padding: spacing['2xl'],
    borderRadius: borderRadius['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: { fontSize: fontSize.xl, marginBottom: spacing.sm },
  modalSubtitle: { fontSize: fontSize.md, marginBottom: spacing.lg },
  modalInput: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: fontSize.md,
    marginBottom: spacing.xl,
  },
  modalActions: { flexDirection: 'row', gap: spacing.md },
});

export default ReceivedRequestDetailScreen;
