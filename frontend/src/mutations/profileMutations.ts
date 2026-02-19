// ============================================================
// PROFILE MUTATIONS - React Query mutations para perfil
// ============================================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import type { UpdateProfileData, ChangePasswordData, UserProfile } from '../types/profileTypes';

/**
 * useUpdateProfile - Mutation para actualizar información del perfil
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => profileService.updateProfile(data),
    onSuccess: (updatedProfile: UserProfile) => {
      // Invalidar y actualizar cache
      queryClient.setQueryData(['my-profile'], updatedProfile);
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
  });
};

/**
 * useChangePassword - Mutation para cambiar contraseña
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => profileService.changePassword(data),
  });
};

/**
 * useUploadAvatar - Mutation para subir foto de perfil
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: (data) => {
      // Actualizar el avatar en el cache del perfil
      queryClient.setQueryData(['my-profile'], (old: UserProfile | undefined) => {
        if (!old) return old;
        return { ...old, avatarUrl: data.avatarUrl };
      });
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
  });
};
