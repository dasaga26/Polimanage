import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService, type CreateBookingData } from '../../services/bookingService';
import Swal from 'sweetalert2';

export const useCreateBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateBookingData) => bookingService.createBooking(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            Swal.fire({
                icon: 'success',
                title: '¡Reserva creada!',
                text: 'La reserva se ha creado correctamente',
                timer: 2000,
                showConfirmButton: false,
            });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { error?: string } } };
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.error || 'No se pudo crear la reserva',
            });
        },
    });
};
