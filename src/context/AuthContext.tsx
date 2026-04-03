/**
 * Kempaga — Auth Context
 * Gere o estado de autenticação, token e dados do utilizador
 */

import React, { createContext, useState, useEffect, useCallback, useMemo, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/services/authService';
import { TOKEN_KEY } from '@/api/api';
import type { User } from '@/types';
import { getErrorMessage } from '@/utils/helpers';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hidratar sessão ao iniciar — lê token do AsyncStorage e busca dados do user
  useEffect(() => {
    const hydrate = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (savedToken) {
          setToken(savedToken);
          const { user: userData } = await authService.getUser();
          setUser(userData);
        }
      } catch (error) {
        // Token inválido ou expirado
        await AsyncStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    hydrate();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const register = useCallback(async (formData: FormData) => {
    try {
      const response = await authService.register(formData);
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignora erro no logout (token pode já estar inválido)
    } finally {
      await AsyncStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { user: userData } = await authService.getUser();
      setUser(userData);
    } catch (error) {
      console.warn('Erro ao atualizar dados do user:', error);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, register, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para aceder ao contexto de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
