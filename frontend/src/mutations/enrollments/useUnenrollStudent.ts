import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentService } from '@/services/enrollmentService';

export const useUnenrollStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: number) => enrollmentService.unenroll(enrollmentId),
    onSuccess: () => {
      // Invalidar múltiples queries para actualizar toda la UI
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
