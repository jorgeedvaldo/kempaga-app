/**
 * Wallet Service — Consultar saldo e dados da carteira
 */

import api from '@/api/api';
import type { Wallet } from '@/types';

export const walletService = {
  /**
   * Obter dados da carteira do utilizador autenticado
   */
  async getWallet(): Promise<{ wallet: Wallet }> {
    const { data } = await api.get('/wallet');
    return data;
  },
};
