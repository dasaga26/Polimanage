// ============================================================
// PROFILE QUERIES - React Query hooks para perfiles
// ============================================================

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import type { PublicProfile } from '../services/profileService';

/**
 * useProfile - Hook para obtener perfil público por username
 * Ejemplo de React Query para datos NO auth
 */
export const useProfile = (username: string): UseQueryResult<PublicProfile, Error> => {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => profileService.getByUsername(username),
    enabled: !!username, // Solo ejecutar si hay username
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });
};
