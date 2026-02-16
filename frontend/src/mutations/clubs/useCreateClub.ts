import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clubService } from '@/services/clubService';
import type { CreateClubData } from '@/types/clubTypes';

export const useCreateClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clubData: CreateClubData) => clubService.create(clubData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
  });
};
