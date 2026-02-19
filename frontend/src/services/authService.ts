// ============================================================
// AUTH SERVICE - API calls para autenticación V2
// V2: Soporta cookies HttpOnly, deviceId, y refresh automático
// ============================================================

import { apiGo } from './api';
import type { LoginCredentials, RegisterData, AuthResponse, User, RefreshResponse } from '../types/authTypes';

export const authService = {
  /**
   * Login - Autenticar usuario (V2)
   * Retorna accessToken y deviceId, refreshToken va en cookie
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiGo.post<AuthResponse>('/auth/login', credentials, {
      withCredentials: true, // V2: Habilitar cookies
    });
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
   * Refresh Token - Renovar token expirado (V2)
   * Lee refresh token de cookie automáticamente
   */
  refreshToken: async (): Promise<RefreshResponse> => {
    const { data } = await apiGo.post<RefreshResponse>('/auth/refresh', {}, {
      withCredentials: true, // V2: Enviar cookie automáticamente
    });
    return data;
  },

  /**
   * Logout - Cerrar sesión del dispositivo actual (V2)
   */
  logout: async (deviceId: string | null): Promise<void> => {
    await apiGo.post('/auth/logout', { deviceId }, {
      withCredentials: true, // V2: Limpiar cookie
    });
  },

  /**
   * Logout All - Cerrar todas las sesiones (V2)
   */
  logoutAll: async (token: string): Promise<void> => {
    await apiGo.post('/auth/logout-all', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
  },
};
