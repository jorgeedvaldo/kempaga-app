/**
 * Request Service — Pedidos de dinheiro (criar, listar, responder, cancelar)
 */

import api from '@/api/api';
import type { MoneyRequest, PaginatedResponse, MoneyRequestFilters } from '@/types';

export const requestService = {
  /**
   * Listar pedidos de dinheiro com filtros
   */
  async getRequests(
    filters?: MoneyRequestFilters
  ): Promise<PaginatedResponse<MoneyRequest>> {
    const { data } = await api.get('/money-requests', { params: filters });
    return data;
  },

  /**
   * Criar um novo pedido de dinheiro
   */
  async createRequest(
    receiver_id: number,
    amount: number,
    note?: string
  ): Promise<{ message: string; money_request: MoneyRequest }> {
    const { data } = await api.post('/money-requests', {
      receiver_id,
      amount,
      note,
    });
    return data;
  },

  /**
   * Aceitar ou rejeitar um pedido de dinheiro
   */
  async respondRequest(
    id: number,
    status: 'accepted' | 'rejected',
    rejection_note?: string
  ): Promise<{ message: string; money_request: MoneyRequest }> {
    // AGENT.md instruiu o backend a receber a anotação sob o nome "note" no endpoint /respond
    const { data } = await api.put(`/money-requests/${id}/respond`, { 
      status, 
      note: rejection_note 
    });
    return data;
  },

  /**
   * Cancelar um pedido de dinheiro enviado
   */
  async cancelRequest(id: number): Promise<{ message: string }> {
    const { data } = await api.delete(`/money-requests/${id}`);
    return data;
  },
};
