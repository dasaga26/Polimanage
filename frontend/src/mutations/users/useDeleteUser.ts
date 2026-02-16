import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => userService.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
