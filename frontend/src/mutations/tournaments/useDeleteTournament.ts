import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tournamentService } from '@/services/otherServices';

export const useDeleteTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tournamentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
};
