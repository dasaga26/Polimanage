// ============================================================
// PROFILE SERVICE - API calls para perfiles públicos
// ============================================================

import { apiGo } from './api';

export interface PublicProfile {
  username: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
}

export const profileService = {
  /**
   * Get Profile - Obtener perfil público por username
   */
  getByUsername: async (username: string): Promise<PublicProfile> => {
    const { data } = await apiGo.get<PublicProfile>(`/profiles/${username}`);
    return data;
  },
};
