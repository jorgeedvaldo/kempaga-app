/**
 * Transaction Service — Enviar dinheiro e consultar transações
 */

import api from '@/api/api';
import type { Transaction, PaginatedResponse, TransactionFilters } from '@/types';

export const transactionService = {
  /**
   * Enviar dinheiro para outro utilizador
   */
  async sendMoney(
    receiver_id: number,
    amount: number,
    note?: string
  ): Promise<{ message: string; transaction: Transaction }> {
    const { data } = await api.post('/transactions', {
      receiver_id,
      amount,
      note,
    });
    return data;
  },

  /**
   * Listar transações com filtros opcionais
   */
  async getTransactions(
    filters?: TransactionFilters
  ): Promise<PaginatedResponse<Transaction>> {
    const { data } = await api.get('/transactions', { params: filters });
    return data;
  },

  /**
   * Ver detalhes de uma transação específica
   */
  async getTransaction(id: number): Promise<{ transaction: Transaction }> {
    const { data } = await api.get(`/transactions/${id}`);
    return data;
  },
};
