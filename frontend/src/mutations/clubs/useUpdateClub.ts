import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clubService } from '@/services/clubService';
import type { UpdateClubData } from '@/types/clubTypes';

export const useUpdateClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateClubData }) =>
      clubService.update(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
  });
};
