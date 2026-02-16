// ============================================================
// AUTH CONTEXT - Context API para estado global de autenticación
// ============================================================

import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, LoginCredentials, RegisterData, AuthContextType } from '../types/authTypes';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_KEY = 'polimanage_token';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  // ============================================================
  // INICIALIZACIÓN - Cargar datos del localStorage
  // ============================================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);

        if (storedToken) {
          setToken(storedToken);
          
          // Validar token con el backend y obtener usuario
          try {
            const userData = await authService.getMe(storedToken);
            setUser(userData);
          } catch (error) {
            // Token inválido o expirado
            console.error('Token inválido:', error);
            localStorage.removeItem(TOKEN_KEY);
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ============================================================
  // LOGIN - Autenticar usuario
  // ============================================================
  const useLogin = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      setErrorMSG(null);
      setIsCorrect(false);

      const response = await authService.login(credentials);

      // Guardar solo token en localStorage
      localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
      setIsCorrect(true);

      console.log('✅ Login exitoso:', response.user.email);
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      
      const message = error.response?.data?.error || 'Error al iniciar sesión';
      setErrorMSG(message);
      setIsCorrect(false);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // REGISTER - Crear nueva cuenta
  // ============================================================
  const useRegister = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      setErrorMSG(null);
      setIsCorrect(false);

      const response = await authService.register(data);

      // Guardar solo token en localStorage
      localStorage.setItem(TOKEN_KEY, response.token);
      // Actualizar estado
      setToken(response.token);
      setUser(response.user);
      setIsCorrect(true);

      console.log('✅ Registro exitoso:', response.user.email);
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      
      const message = error.response?.data?.error || 'Error al crear cuenta';
      setErrorMSG(message);
      setIsCorrect(false);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // LOGOUT - Cerrar sesión
  // ============================================================
  const logout = (): void => {
    try {
      // Limpiar token de localStorage
      localStorage.removeItem(TOKEN_KEY);
      // Limpiar estado
      setToken(null);
      setUser(null);
      setIsCorrect(false);
      setErrorMSG(null);

      console.log('✅ Logout exitoso');
    } catch (error) {
      console.error('❌ Error en logout:', error);
    }
  };

  // ============================================================
  // REFRESH TOKEN - Renovar token expirado
  // ============================================================
  const refreshToken = async (): Promise<void> => {
    try {
      if (!token) {
        throw new Error('No hay token para renovar');
      }

      const response = await authService.refreshToken(token);

      // Actualizar token en localStorage
      localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);

      console.log('✅ Token renovado');
    } catch (error) {
      console.error('❌ Error al renovar token:', error);
      logout();
      throw error;
    }
  };

  // ============================================================
  // CONTEXT VALUE
  // ============================================================
  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    errorMSG,
    useLogin,
    useRegister,
    logout,
    refreshToken,
    isCorrect,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
