import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pistaService } from '@/services/pistaService';

export const useDeletePista = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pistaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pistas'] });
    },
  });
};
