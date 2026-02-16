import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import Swal from 'sweetalert2';

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bookingService.deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      Swal.fire({
        icon: 'success',
        title: '¡Eliminada!',
        text: 'La reserva se ha eliminado correctamente',
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'No se pudo eliminar la reserva',
      });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bookingService.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      Swal.fire({
        icon: 'success',
        title: '¡Cancelada!',
        text: 'La reserva se ha cancelado correctamente',
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'No se pudo cancelar la reserva',
      });
    },
  });
};
