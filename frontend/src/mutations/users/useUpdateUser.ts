import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type UpdateUserDTO } from '@/services/userService';

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateUserDTO }) =>
      userService.update(slug, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.slug] });
    },
  });
};
