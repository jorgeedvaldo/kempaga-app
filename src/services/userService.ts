/**
 * User Service — Pesquisar utilizadores e atualizar perfil
 */

import api from '@/api/api';
import type { UserSearchResult, User } from '@/types';

export const userService = {
  /**
   * Pesquisar utilizadores por nome, email ou telefone
   */
  async searchUsers(query: string): Promise<{ users: UserSearchResult[] }> {
    const { data } = await api.get('/users/search', { params: { query } });
    return data;
  },

  /**
   * Ver perfil público de um utilizador
   */
  async getUser(id: number): Promise<{ user: User }> {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  /**
   * Atualizar perfil do utilizador autenticado
   */
  async updateProfile(data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    bi_number?: string;
  }): Promise<{ message: string; user: User }> {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  /**
   * Upload dedicado de foto de perfil
   */
  async uploadProfileImage(
    formData: FormData
  ): Promise<{ message: string; image_url: string }> {
    const { data } = await api.post('/users/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /**
   * Registar o token de notificações Push
   */
  async updateDeviceToken(token: string): Promise<void> {
    await api.post('/users/device-token', { token });
  },
};
