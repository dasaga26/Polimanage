// ============================================================
// AUTH CONTEXT - Context API para estado global de autenticación V2
// V2: Soporta multi-device, cookies HttpOnly, y BroadcastChannel
// ============================================================

import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, LoginCredentials, RegisterData, AuthContextType, AuthCallbacks } from '../types/authTypes';
import { v4 as uuidv4 } from 'uuid';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_KEY = 'polimanage_token';
const DEVICE_ID_KEY = 'polimanage_device_id'; // V2

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null); // V2
  const [isLoading, setIsLoading] = useState(true);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);

  // ============================================================
  // V2: INICIALIZAR DEVICE ID
  // ============================================================
  useEffect(() => {
    let storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!storedDeviceId) {
      storedDeviceId = uuidv4();
      localStorage.setItem(DEVICE_ID_KEY, storedDeviceId);
    }
    setDeviceId(storedDeviceId);
  }, []);

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
            // Token inválido o expirado - El interceptor manejará el refresh
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
  // LOGIN - Autenticar usuario (V2)
  // ============================================================
  const useLogin = async (credentials: LoginCredentials, callbacks?: AuthCallbacks): Promise<void> => {
    try {
      setIsLoading(true);
      setErrorMSG(null);

      // V2: Enviar deviceId si ya existe
      const loginData = {
        ...credentials,
        deviceId: deviceId || undefined,
      };

      const response = await authService.login(loginData);

      // V2: Guardar access token en localStorage
      localStorage.setItem(TOKEN_KEY, response.accessToken);
      setToken(response.accessToken);
      setUser(response.user);

      // V2: Actualizar deviceId si el backend retornó uno nuevo
      if (response.deviceId) {
        localStorage.setItem(DEVICE_ID_KEY, response.deviceId);
        setDeviceId(response.deviceId);
      }

      console.log('✅ Login exitoso:', response.user.email);
      
      // Ejecutar callback de éxito si existe
      callbacks?.onSuccess?.();
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      
      const message = error.response?.data?.error || 'Error al iniciar sesión';
      setErrorMSG(message);
      
      // Ejecutar callback de error si existe
      callbacks?.onError?.(error);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // REGISTER - Crear nueva cuenta (NO auto-loguear)
  // ============================================================
  const useRegister = async (data: RegisterData, callbacks?: AuthCallbacks): Promise<void> => {
    try {
      setIsLoading(true);
      setErrorMSG(null);

      const response = await authService.register(data);

      // NO guardamos token ni actualizamos estado - el usuario debe hacer login manualmente
      console.log('✅ Registro exitoso:', response.user.email);
      
      // Ejecutar callback de éxito si existe
      callbacks?.onSuccess?.();
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      
      const message = error.response?.data?.error || 'Error al crear cuenta';
      setErrorMSG(message);
      
      // Ejecutar callback de error si existe
      callbacks?.onError?.(error);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // LOGOUT - Cerrar sesión del dispositivo actual (V2)
  // ============================================================
  const logout = (): void => {
    try {
      // V2: Notificar al backend
      if (deviceId) {
        authService.logout(deviceId).catch(err => {
          console.error('Error al hacer logout en backend:', err);
        });
      }

      // Limpiar localStorage
      localStorage.removeItem(TOKEN_KEY);
      // NO eliminar deviceId, se reutiliza en próximos logins
      
      // Limpiar estado
      setToken(null);
      setUser(null);
      setErrorMSG(null);

      console.log('✅ Logout exitoso');
    } catch (error) {
      console.error('❌ Error en logout:', error);
    }
  };

  // ============================================================
  // V2: LOGOUT ALL - Cerrar todas las sesiones (Logout Global)
  // ============================================================
  const logoutAll = async (): Promise<void> => {
    try {
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      // Llamar al endpoint de logout global
      await authService.logoutAll(token);

      // Limpiar localStorage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(DEVICE_ID_KEY);
      
      // Limpiar estado
      setToken(null);
      setUser(null);
      setDeviceId(null);
      setErrorMSG(null);

      // Generar nuevo deviceId
      const newDeviceId = uuidv4();
      localStorage.setItem(DEVICE_ID_KEY, newDeviceId);
      setDeviceId(newDeviceId);

      console.log('✅ Logout global exitoso');
    } catch (error) {
      console.error('❌ Error en logout global:', error);
      throw error;
    }
  };

  // ============================================================
  // REFRESH TOKEN - Renovar token expirado (V2)
  // El interceptor de Axios maneja esto automáticamente
  // Esta función es para uso manual si se necesita
  // ============================================================
  const refreshToken = async (): Promise<void> => {
    try {
      // V2: No necesita token como parámetro, usa cookie
      const response = await authService.refreshToken();

      // Actualizar access token en localStorage
      localStorage.setItem(TOKEN_KEY, response.accessToken);
      setToken(response.accessToken);

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
    deviceId, // V2
    isAuthenticated: !!user && !!token,
    isLoading,
    errorMSG,
    useLogin,
    useRegister,
    logout,
    logoutAll, // V2
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
