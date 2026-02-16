import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classService } from '@/services/classService';

export const useDeleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => classService.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
};
