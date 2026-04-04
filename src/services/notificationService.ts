/**
 * Notification Service — Listar e gerir notificações
 */

import api from '@/api/api';
import type { PaginatedResponse } from '@/types';

export interface AppNotification {
  id: string;
  type: string;
  data: {
    title?: string;
    body?: string;
    message?: string;
    money_request_id?: number;
    transaction_id?: number;
    amount?: string;
    sender_name?: string;
    receiver_name?: string;
    [key: string]: any;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export const notificationService = {
  /**
   * Listar notificações do utilizador autenticado
   */
  async getNotifications(
    page: number = 1
  ): Promise<PaginatedResponse<AppNotification>> {
    const { data } = await api.get('/notifications', { params: { page } });
    return data;
  },

  /**
   * Marcar uma notificação como lida
   */
  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  },
};
