/**
 * Auth Service — Login, Registo, Logout e Perfil
 */

import api from '@/api/api';
import type { AuthResponse, User } from '@/types';

export const authService = {
  /**
   * Iniciar sessão com email e password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  /**
   * Registar nova conta (suporta upload de imagem via FormData)
   */
  async register(formData: FormData): Promise<AuthResponse> {
    const { data } = await api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /**
   * Obter dados do utilizador autenticado
   */
  async getUser(): Promise<{ user: User }> {
    const { data } = await api.get('/auth/user');
    return data;
  },

  /**
   * Terminar sessão e revogar token
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
