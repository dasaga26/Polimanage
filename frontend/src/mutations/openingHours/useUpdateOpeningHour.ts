import { useMutation, useQueryClient } from '@tanstack/react-query';
import { openingHourService } from '@/services/otherServices';

export const useUpdateOpeningHour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      openingHourService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opening-hours'] });
    },
  });
};
