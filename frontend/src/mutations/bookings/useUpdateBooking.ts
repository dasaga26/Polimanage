import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService, type UpdateBookingData } from '@/services/bookingService';

interface UpdateBookingParams {
    id: number;
    data: UpdateBookingData;
}

export const useUpdateBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: UpdateBookingParams) => bookingService.updateBooking(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
};
