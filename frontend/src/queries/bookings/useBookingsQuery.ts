import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';

export const useBookingsQuery = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingService.getAllBookings(),
  });
};

export const useBookingQuery = (id: number) => {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingService.getBooking(id),
    enabled: !!id,
  });
};

export const useBookingsByPistaAndDateQuery = (pistaId: number, date: string, enabled = true) => {
  return useQuery({
    queryKey: ['bookings', 'pista', pistaId, 'date', date],
    queryFn: () => bookingService.getBookingsByPistaAndDate(pistaId, date),
    enabled: enabled && !!pistaId && !!date,
  });
};
