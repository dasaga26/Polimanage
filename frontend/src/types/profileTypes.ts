// ============================================================
// PROFILE TYPES - Interfaces para perfil de usuario
// ============================================================

import type { User } from './authTypes';

export interface UserProfile extends User {
  dni?: string;
  memberSince?: string;
  isPremium?: boolean;
}

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  dni?: string;
  avatarUrl?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  dni: string;
}
