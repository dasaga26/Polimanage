import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pistaService, type UpdatePistaDTO } from '@/services/pistaService';

export const useUpdatePista = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePistaDTO }) =>
      pistaService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pistas'] });
      queryClient.invalidateQueries({ queryKey: ['pistas', variables.id] });
    },
  });
};
