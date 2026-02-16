import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type CreateUserDTO } from '@/services/userService';

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDTO) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
