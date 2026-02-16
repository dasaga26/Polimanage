import { useQuery } from '@tanstack/react-query';
import { clubService } from '@/services/clubService';
import { publicClubService } from '@/services/publicClubService';

export function useClubsQuery() {
  return useQuery({
    queryKey: ['clubs'],
    queryFn: clubService.getAll,
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
