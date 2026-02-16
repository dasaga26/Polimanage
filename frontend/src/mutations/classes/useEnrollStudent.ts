import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classService } from '@/services/classService';

export const useEnrollStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classSlug, userSlug }: { classSlug: string; userSlug: string }) =>
      classService.enroll(classSlug, userSlug),
    onSuccess: () => {
      // Invalidar múltiples queries para actualizar toda la UI
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
