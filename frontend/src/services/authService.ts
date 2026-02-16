// ============================================================
// AUTH SERVICE - API calls para autenticación
// ============================================================

import { apiGo } from './api';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../types/authTypes';

export const authService = {
  /**
   * Login - Autenticar usuario
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiGo.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  /**
   * Register - Crear nueva cuenta
   */
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await apiGo.post<AuthResponse>('/auth/register', userData);
    return data;
  },

  /**
   * Get Me - Obtener usuario autenticado actual
   */
  getMe: async (token: string): Promise<User> => {
    const { data } = await apiGo.get<User>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },

  /**
   * Refresh Token - Renovar token expirado
   */
  refreshToken: async (token: string): Promise<{ token: string }> => {
    const { data } = await apiGo.post<{ token: string }>(
      '/auth/refresh',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  },

  /**
   * Logout - Cerrar sesión
   */
  logout: async (token: string): Promise<void> => {
    await apiGo.post(
      '/auth/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
};
