/**
 * NotificationsScreen — Lista de todas as notificações do utilizador
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, fontFamily, fontSize, spacing, borderRadius } from '@/theme';
import { notificationService, AppNotification } from '@/services/notificationService';
import { formatDate } from '@/utils/helpers';
import EmptyState from '@/components/EmptyState';

const NotificationsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(
    async (pageNum: number = 1, isRefresh: boolean = false) => {
      try {
        setError(null);
        const response = await notificationService.getNotifications(pageNum);
        
        let items = [];
        let rLastPage = 1;

        if (Array.isArray(response)) {
          items = response;
        } else if (response && Array.isArray(response.data)) {
          items = response.data;
          rLastPage = response.last_page || 1;
        }

        // Tentar formatar a data caso o backend a devolva como string (falta de cast no Model)
        items = items.map((item: any) => {
          if (typeof item.data === 'string') {
            try {
              item.data = JSON.parse(item.data);
            } catch (e) {
              item.data = {};
            }
          }
          return item;
        });

        if (pageNum === 1 || isRefresh) {
          setNotifications(items);
        } else {
          setNotifications((prev) => [...prev, ...items]);
        }
        setLastPage(rLastPage);
        setPage(pageNum);
      } catch (err: any) {
        // Se a API retorna 404 ou não tem endpoint de notificações,
        // mostramos mensagem amigável
        if (err?.response?.status === 404 || err?.response?.status === 500) {
          setError('api_not_available');
        } else {
          console.warn('Erro ao carregar notificações:', err);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchNotifications(1, true);
    }, [fetchNotifications])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(1, true);
  }, [fetchNotifications]);

  const loadMore = () => {
    if (page < lastPage && !loading) {
      fetchNotifications(page + 1);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
    } catch (err) {
      console.warn('Erro ao marcar notificações como lidas:', err);
    }
  };

  const getNotificationIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    if (type.includes('MoneyRequest') || type.includes('money_request')) {
      return 'mail-outline';
    }
    if (type.includes('Transfer') || type.includes('transaction') || type.includes('payment')) {
      return 'wallet-outline';
    }
    if (type.includes('Accept') || type.includes('accepted')) {
      return 'checkmark-circle-outline';
    }
    if (type.includes('Reject') || type.includes('rejected')) {
      return 'close-circle-outline';
    }
    return 'notifications-outline';
  };

  const getNotificationColor = (type: string) => {
    if (type.includes('Accept') || type.includes('accepted') || type.includes('Transfer') || type.includes('receive')) {
      return colors.brandGreen;
    }
    if (type.includes('Reject') || type.includes('rejected')) {
      return colors.danger;
    }
    if (type.includes('MoneyRequest') || type.includes('money_request')) {
      return colors.brandPurple;
    }
    return colors.warning;
  };

  const getNotificationText = (notification: AppNotification) => {
    const { data } = notification;
    // Tentar usar title/body se disponíveis, senão message
    if (data.title) return data.title;
    if (data.message) return data.message;
    if (data.body) return data.body;
    return 'Nova notificação';
  };

  const getNotificationSubtext = (notification: AppNotification) => {
    const { data } = notification;
    if (data.body && data.title) return data.body;
    if (data.amount) return `${data.amount} AOA`;
    return '';
  };

  const hasUnread = notifications.some((n) => !n.read_at);

  const renderNotification = ({ item }: { item: AppNotification }) => {
    const isUnread = !item.read_at;
    const iconName = getNotificationIcon(item.type);
    const iconColor = getNotificationColor(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            backgroundColor: isUnread ? colors.brandPurpleLight : colors.card,
            borderColor: colors.border,
          },
        ]}
        activeOpacity={0.7}
        onPress={async () => {
          if (isUnread) {
            try {
              await notificationService.markAsRead(item.id);
              setNotifications((prev) =>
                prev.map((n) =>
                  n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n
                )
              );
            } catch (err) {
              // Silêncio — não bloquear UI
            }
          }
          
          // Navegação consoante o tipo/dados da notificação
          const typeStr = (item.data.type || item.type || '').toLowerCase();
          
          if (item.data.transaction_id || typeStr.includes('transfer') || typeStr.includes('payment')) {
            (navigation as any).navigate('TransactionsTab');
          } else if (item.data.money_request_id || typeStr.includes('request') || typeStr.includes('accept') || typeStr.includes('reject')) {
            (navigation as any).navigate('RequestsTab');
          }
        }}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
          <Ionicons name={iconName} size={22} color={iconColor} />
        </View>
        <View style={styles.notificationContent}>
          <Text
            style={[
              styles.notificationTitle,
              {
                color: colors.textPrimary,
                fontFamily: isUnread ? fontFamily.bold : fontFamily.semiBold,
              },
            ]}
            numberOfLines={2}
          >
            {getNotificationText(item)}
          </Text>
          {getNotificationSubtext(item) ? (
            <Text
              style={[
                styles.notificationBody,
                { color: colors.textMuted, fontFamily: fontFamily.regular },
              ]}
              numberOfLines={2}
            >
              {getNotificationSubtext(item)}
            </Text>
          ) : null}
          <Text
            style={[
              styles.notificationTime,
              { color: colors.textMuted, fontFamily: fontFamily.regular },
            ]}
          >
            {formatDate(item.created_at)}
          </Text>
        </View>
        {isUnread ? (
          <View style={[styles.unreadDot, { backgroundColor: colors.brandPurple }]} />
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderColor: colors.border, paddingTop: Math.max(insets.top, spacing['5xl']) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
          Notificações
        </Text>
        {hasUnread ? (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Ionicons name="checkmark-done-outline" size={24} color={colors.brandPurple} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brandPurple} />
        </View>
      ) : error === 'api_not_available' ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon="notifications-off-outline"
            title="Sem notificações"
            description="As notificações aparecerão aqui quando receber dinheiro, pedidos, ou quando os seus pedidos forem aceites/rejeitados."
          />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotification}
          contentContainerStyle={[styles.list, { paddingBottom: Math.max(insets.bottom, spacing['6xl']) }]}
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
            <View style={{ flex: 1, justifyContent: 'center', marginTop: spacing['5xl'] }}>
              <EmptyState
                icon="notifications-off-outline"
                title="Sem notificações"
                description="As notificações aparecerão aqui quando receber dinheiro, pedidos, ou quando os seus pedidos forem aceites/rejeitados."
              />
            </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: fontSize.xl },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing['6xl'],
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  notificationBody: {
    fontSize: fontSize.sm,
    marginTop: 2,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default NotificationsScreen;
