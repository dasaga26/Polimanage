import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clubService } from '@/services/clubService';

export const useDeleteClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => clubService.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
  });
};
