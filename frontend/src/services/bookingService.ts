import api from './api';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';

export interface Booking {
  id: number;
  userId: string; // UUID
  userName: string;
  pistaId: number;
  pistaName: string;
  pistaType: string;
  startTime: string; // ISO 8601 string
  endTime: string;
  priceSnapshotCents: number;
  priceSnapshotEuros: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  userId?: string; // UUID opcional
  pistaId: number;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface UpdateBookingData extends CreateBookingData {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
}

export const bookingService = {
  getAllBookings: async (): Promise<Booking[]> => {
    const response = await api.get('/bookings');
    return response.data;
  },

  getBooking: async (id: number): Promise<Booking> => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  getBookingsByPistaAndDate: async (pistaId: number, date: string): Promise<Booking[]> => {
    const response = await api.get(`/bookings/pista/${pistaId}/date/${date}`);
    return response.data;
  },

  createBooking: async (data: CreateBookingData): Promise<Booking> => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  updateBooking: async (id: number, data: UpdateBookingData): Promise<Booking> => {
    const response = await api.put(`/bookings/${id}`, data);
    return response.data;
  },

  deleteBooking: async (id: number): Promise<void> => {
    await api.delete(`/bookings/${id}`);
  },

  cancelBooking: async (id: number): Promise<Booking> => {
    const response = await api.post(`/bookings/${id}/cancel`);
    return response.data;
  },
};
