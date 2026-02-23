import { useQuery } from '@tanstack/react-query';
import { userService, type UserQueryParams } from '@/services/userService';

export const useUsersQuery = (params?: UserQueryParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getAll(params),
    staleTime: 30000,
  });
};

export const useUserQuery = (slug: string) => {
  return useQuery({
    queryKey: ['users', slug],
    queryFn: () => userService.getBySlug(slug),
    enabled: !!slug,
  });
};
