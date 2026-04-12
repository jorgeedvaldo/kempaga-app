/**
 * Kempaga — Axios API Instance
 * Interceptors para autenticação e tratamento de erros
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';

const TOKEN_KEY = '@kempaga_token';

const api = axios.create({
  baseURL: 'https://kempaga.toolpdf.org/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor — adicionar token de autenticação
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Erro ao ler token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — tratar erros globais
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado — limpa sessão
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

export { TOKEN_KEY };
export default api;
