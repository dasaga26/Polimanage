// ============================================================
// PROFILE QUERIES - React Query hooks para perfil del usuario autenticado
// ============================================================

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import type { UserProfile } from '../types/profileTypes';

/**
 * useMyProfile - Hook para obtener el perfil del usuario autenticado
 */
export const useMyProfile = (): UseQueryResult<UserProfile, Error> => {
  return useQuery({
    queryKey: ['my-profile'],
    queryFn: () => profileService.getMyProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });
};
