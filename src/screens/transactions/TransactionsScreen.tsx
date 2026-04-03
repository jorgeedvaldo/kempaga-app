/**
 * TransactionsScreen — Histórico de transações com filtros e paginação
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { useTheme, fontFamily, fontSize, spacing, borderRadius } from '@/theme';
import { transactionService } from '@/services/transactionService';
import TransactionItem from '@/components/TransactionItem';
import { TransactionSkeleton } from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';
import type { Transaction, TransactionFilters } from '@/types';

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'send', label: 'Enviados' },
  { key: 'receive', label: 'Recebidos' },
] as const;

const TransactionsScreen: React.FC = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchTransactions = useCallback(
    async (pageNum: number = 1, isRefresh: boolean = false) => {
      try {
        const filters: TransactionFilters = { page: pageNum };
        if (activeFilter !== 'all') {
          filters.type = activeFilter as 'send' | 'receive';
        }

        const response = await transactionService.getTransactions(filters);

        if (pageNum === 1 || isRefresh) {
          setTransactions(response.data);
        } else {
          setTransactions((prev) => [...prev, ...response.data]);
        }
        setLastPage(response.last_page);
        setPage(pageNum);
      } catch (error) {
        console.warn('Erro ao carregar transações:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [activeFilter]
  );

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchTransactions(1, true);
    }, [fetchTransactions])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions(1, true);
  }, [fetchTransactions]);

  const loadMore = useCallback(() => {
    if (page < lastPage && !loadingMore) {
      setLoadingMore(true);
      fetchTransactions(page + 1);
    }
  }, [page, lastPage, loadingMore, fetchTransactions]);

  const onFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setLoading(true);
    setTransactions([]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
          Transações
        </Text>
      </View>

      {/* Filtros */}
      <View style={styles.filters}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  activeFilter === filter.key ? colors.brandPurple : colors.card,
                borderColor:
                  activeFilter === filter.key ? colors.brandPurple : colors.border,
              },
            ]}
            onPress={() => onFilterChange(filter.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: activeFilter === filter.key ? '#ffffff' : colors.textPrimary,
                  fontFamily: fontFamily.semiBold,
                },
              ]}
            >
              {filter.label}
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
          <TransactionSkeleton />
          <TransactionSkeleton />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              currentUserId={user?.id || 0}
              onPress={() =>
                navigation.navigate('TransactionDetail', { transaction: item })
              }
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
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title="Sem transações"
              description="As suas transações aparecerão aqui quando fizer ou receber transferências"
            />
          }
          ListFooterComponent={
            loadingMore ? <TransactionSkeleton /> : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['5xl'],
    paddingBottom: spacing.lg,
  },
  title: { fontSize: fontSize['3xl'] },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing['2xl'],
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterText: { fontSize: fontSize.sm },
  skeletonContainer: {
    paddingHorizontal: spacing['2xl'],
  },
  list: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['6xl'],
  },
});

export default TransactionsScreen;
