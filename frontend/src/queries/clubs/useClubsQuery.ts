import { useQuery } from '@tanstack/react-query';
import { clubService } from '@/services/clubService';
import { publicClubService } from '@/services/publicClubService';
import type { ClubQueryParams } from '@/types/clubTypes';

export function useClubsQuery(params?: ClubQueryParams) {
  return useQuery({
    queryKey: ['clubs', params],
    queryFn: () => clubService.getAll(params),
    staleTime: 30000,
  });
}

export function useClubQuery(slug: string) {
  return useQuery({
    queryKey: ['clubs', slug],
    queryFn: () => clubService.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useClubMembersQuery(clubSlug: string) {
  return useQuery({
    queryKey: ['clubs', clubSlug, 'members'],
    queryFn: () => clubService.getMembers(clubSlug),
    enabled: !!clubSlug,
  });
}

export function usePublicClubsQuery() {
  return useQuery({
    queryKey: ['public-clubs'],
    queryFn: () => publicClubService.getAll(),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePublicClubQuery(id: number) {
  return useQuery({
    queryKey: ['public-clubs', id],
    queryFn: () => publicClubService.getById(id),
    enabled: !!id,
  });
}
