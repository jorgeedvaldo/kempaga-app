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
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { useTheme, fontFamily, fontSize, spacing, borderRadius } from '@/theme';
import { requestService } from '@/services/requestService';
import RequestItem from '@/components/RequestItem';
import { TransactionSkeleton } from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';
import type { MoneyRequest, MoneyRequestFilters } from '@/types';

const TABS = [
  { key: 'received', label: 'Recebidos' },
  { key: 'sent', label: 'Enviados' },
] as const;

const RequestsScreen: React.FC = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [requests, setRequests] = useState<MoneyRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

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

  const onTabChange = (tab: 'received' | 'sent') => {
    setActiveTab(tab);
    setLoading(true);
    setRequests([]);
  };

  const loadMore = () => {
    if (page < lastPage && !loading) {
      fetchRequests(page + 1);
    }
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
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
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
});

export default RequestsScreen;
