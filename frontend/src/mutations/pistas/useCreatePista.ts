import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pistaService, type CreatePistaDTO } from '@/services/pistaService';

export const useCreatePista = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePistaDTO) => pistaService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pistas'] });
    },
  });
};
