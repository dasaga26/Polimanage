// ============================================================
// PROFILE SERVICE - API calls para perfil del usuario autenticado
// ============================================================

import { apiGo } from './api';
import type { UserProfile, UpdateProfileData, ChangePasswordData } from '../types/profileTypes';

export const profileService = {
  /**
   * Get My Profile - Obtener perfil del usuario autenticado
   */
  getMyProfile: async (): Promise<UserProfile> => {
    const { data } = await apiGo.get<UserProfile>('/profile/me');
    return data;
  },

  /**
   * Update Profile - Actualizar información del perfil
   */
  updateProfile: async (profileData: UpdateProfileData): Promise<UserProfile> => {
    const { data } = await apiGo.put<UserProfile>('/profile/me', profileData);
    return data;
  },

  /**
   * Change Password - Cambiar contraseña del usuario
   */
  changePassword: async (passwordData: ChangePasswordData): Promise<void> => {
    await apiGo.post('/profile/change-password', passwordData);
  },

  /**
   * Upload Avatar - Subir foto de perfil
   */
  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await apiGo.post<{ avatarUrl: string }>('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};
