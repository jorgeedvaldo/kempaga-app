/**
 * RequestsScreen — Lista de pedidos de dinheiro com abas Recebidos/Enviados
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { useTheme, fontFamily, fontSize, spacing, borderRadius } from '@/theme';
import { requestService } from '@/services/requestService';
import { getErrorMessage } from '@/utils/helpers';
import RequestItem from '@/components/RequestItem';
import { TransactionSkeleton } from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import type { MoneyRequest, MoneyRequestFilters } from '@/types';

const TABS = [
  { key: 'received', label: 'Recebidos' },
  { key: 'sent', label: 'Enviados' },
] as const;

const RequestsScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [requests, setRequests] = useState<MoneyRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Reject Modal State
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [requestToReject, setRequestToReject] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const fetchRequests = useCallback(
    async (pageNum: number = 1, isRefresh: boolean = false) => {
      try {
        const filters: MoneyRequestFilters = {
          filter: activeTab,
          page: pageNum,
        };

        const response = await requestService.getRequests(filters);

        if (pageNum === 1 || isRefresh) {
          setRequests(response.data);
        } else {
          setRequests((prev) => [...prev, ...response.data]);
        }
        setLastPage(response.last_page);
        setPage(pageNum);
      } catch (error) {
        console.warn('Erro ao carregar pedidos:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab]
  );

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchRequests(1, true);
    }, [fetchRequests])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests(1, true);
  }, [fetchRequests]);

  const openRejectModal = (id: number) => {
    setRequestToReject(id);
    setRejectNote('');
    setRejectModalVisible(true);
  };

  const confirmReject = async () => {
    if (requestToReject === null) return;
    
    setRejectModalVisible(false);
    setActionLoadingId(requestToReject);
    try {
      await requestService.respondRequest(requestToReject, 'rejected', rejectNote || undefined);
      fetchRequests(1, true);
      Alert.alert('Sucesso', 'Pedido rejeitado com sucesso.');
    } catch (error) {
      Alert.alert('Erro', getErrorMessage(error));
    } finally {
      setActionLoadingId(null);
      setRequestToReject(null);
    }
  };

  const handleCancel = async (id: number) => {
    Alert.alert('Cancelar Pedido', 'Tem certeza que quer cancelar este pedido?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim, Cancelar',
        style: 'destructive',
        onPress: async () => {
          setActionLoadingId(id);
          try {
            await requestService.cancelRequest(id);
            fetchRequests(1, true);
          } catch (error) {
            Alert.alert('Erro', getErrorMessage(error));
          } finally {
            setActionLoadingId(null);
          }
        },
      },
    ]);
  };

  const onTabChange = (tab: 'received' | 'sent') => {
    setActiveTab(tab);
    setLoading(true);
    setRequests([]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
          Pedidos
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.brandPurple }]}
          onPress={() => navigation.navigate('CreateRequest')}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Abas */}
      <View style={[styles.tabs, { borderColor: colors.border }]}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { borderBottomColor: colors.brandPurple, borderBottomWidth: 2 },
            ]}
            onPress={() => onTabChange(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab.key ? colors.brandPurple : colors.textMuted,
                  fontFamily: fontFamily.semiBold,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      {loading ? (
        <View style={styles.skeletonContainer}>
          <TransactionSkeleton />
          <TransactionSkeleton />
          <TransactionSkeleton />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RequestItem
              request={item}
              currentUserId={user?.id || 0}
              onPress={() => {
                if (activeTab === 'received') {
                  navigation.navigate('ReceivedRequestDetail', { request: item });
                } else {
                  navigation.navigate('SentRequestDetail', { request: item });
                }
              }}
              onReject={() => openRejectModal(item.id)}
              onCancel={() => handleCancel(item.id)}
              loading={actionLoadingId === item.id}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brandPurple}
              colors={[colors.brandPurple]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="mail-open-outline"
              title="Sem pedidos"
              description={
                activeTab === 'received'
                  ? 'Os pedidos que receber aparecerão aqui'
                  : 'Os pedidos que enviar aparecerão aqui'
              }
            />
          }
        />
      )}

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
              Rejeitar Pedido
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted, fontFamily: fontFamily.regular }]}>
              Quer deixar uma justificação opcional para a outra pessoa?
            </Text>
            
            <TextInput
              style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.border, fontFamily: fontFamily.medium }]}
              placeholder="Ex: Já paguei ontem..."
              placeholderTextColor={colors.textMuted}
              value={rejectNote}
              onChangeText={setRejectNote}
              multiline
            />
            
            <View style={styles.modalActions}>
              <Button 
                title="Cancelar" 
                variant="ghost" 
                onPress={() => setRejectModalVisible(false)} 
                fullWidth={false}
                style={{ flex: 1 }}
              />
              <Button 
                title="Confirmar Rejeição" 
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
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['5xl'],
    paddingBottom: spacing.lg,
  },
  title: { fontSize: fontSize['3xl'] },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing['2xl'],
    borderBottomWidth: 1,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabText: { fontSize: fontSize.lg },
  skeletonContainer: { paddingHorizontal: spacing['2xl'] },
  list: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['6xl'],
  },
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
  modalTitle: {
    fontSize: fontSize.xl,
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.lg,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: fontSize.md,
    marginBottom: spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});

export default RequestsScreen;
