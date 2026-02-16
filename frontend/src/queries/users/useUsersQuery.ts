import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/userService';

export const useUsersQuery = (roleId?: number) => {
  return useQuery({
    queryKey: roleId ? ['users', 'role', roleId] : ['users'],
    queryFn: () => userService.getAll(roleId),
  });
};

export const useUserQuery = (slug: string) => {
  return useQuery({
    queryKey: ['users', slug],
    queryFn: () => userService.getBySlug(slug),
    enabled: !!slug,
  });
};
