import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classService } from '@/services/classService';
import type { CreateClassDTO } from '@/types/classTypes';

export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClassDTO) => classService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
};
