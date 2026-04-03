/**
 * HomeScreen — Ecrã principal com saldo, ações rápidas e transações recentes
 * Replica o design do mockup HTML de home
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { useTheme, fontFamily, fontSize, spacing, borderRadius } from '@/theme';
import { transactionService } from '@/services/transactionService';
import { getGreeting } from '@/utils/helpers';
import Avatar from '@/components/Avatar';
import BalanceCard from '@/components/BalanceCard';
import QuickActions from '@/components/QuickActions';
import TransactionItem from '@/components/TransactionItem';
import { TransactionSkeleton, BalanceSkeleton } from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';
import type { Transaction } from '@/types';

const HomeScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [txResponse] = await Promise.all([
        transactionService.getTransactions({ page: 1 }),
        refreshUser(),
      ]);
      setTransactions(txResponse.data.slice(0, 5));
    } catch (error) {
      console.warn('Erro ao carregar dados Home:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshUser]);

  // Recarrega dados ao focar na tela
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const balance = user?.wallet?.balance || '0.00';
  const currency = user?.wallet?.currency || 'AOA';

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brandPurple}
            colors={[colors.brandPurple]}
          />
        }
      >
        {/* Header: Avatar + Saudação + Notificações */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar
              imageUrl={user?.image_url}
              name={user?.full_name || 'User'}
              size={48}
              showBorder
            />
            <View>
              <Text
                style={[styles.greeting, { color: colors.textMuted, fontFamily: fontFamily.regular }]}
              >
                {getGreeting()},
              </Text>
              <Text
                style={[styles.userName, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}
              >
                {user?.first_name || 'Utilizador'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.notificationButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.notificationDot} />
            <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Cartão de Saldo */}
        {loading ? (
          <BalanceSkeleton />
        ) : (
          <BalanceCard balance={balance} currency={currency} />
        )}

        {/* Ações Rápidas */}
        <QuickActions
          onSend={() => navigation.navigate('SendMoney')}
          onReceive={() => navigation.navigate('CreateRequest')}
        />

        {/* Transações Recentes */}
        <View style={styles.sectionHeader}>
          <Text
            style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}
          >
            Movimentos Recentes
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('TransactionsTab')}>
            <Text
              style={[
                styles.seeAll,
                { color: colors.brandPurple, fontFamily: fontFamily.semiBold },
              ]}
            >
              Ver todos
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <>
            <TransactionSkeleton />
            <TransactionSkeleton />
            <TransactionSkeleton />
          </>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="Sem movimentos"
            description="As suas transações aparecerão aqui"
          />
        ) : (
          transactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              currentUserId={user?.id || 0}
              onPress={() => navigation.navigate('TransactionDetail', { transactionId: tx.id })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['5xl'],
    paddingBottom: spacing['6xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  greeting: {
    fontSize: fontSize.md,
  },
  userName: {
    fontSize: fontSize.xl,
    lineHeight: 24,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    zIndex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
  },
  seeAll: {
    fontSize: fontSize.md,
  },
});

export default HomeScreen;
