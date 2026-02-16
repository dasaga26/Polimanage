import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clubService } from '@/services/clubService';

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (membershipId: number) => clubService.removeMember(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      queryClient.invalidateQueries({ queryKey: ['club-members'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
