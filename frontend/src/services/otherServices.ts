import { apiGo } from './api';

// ============================================================
// DASHBOARD STATS
// ============================================================

export interface MonthlyGrowth {
    users: number;
    bookings: number;
    revenue: number;
}

export interface DashboardStats {
    totalUsers: number;
    totalBookings: number;
    totalRevenue: number;
    activeSubscriptions: number;
    monthlyGrowth: MonthlyGrowth;
}

export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        try {
            const response = await apiGo.get<DashboardStats>('/admin/stats');
            return response.data;
        } catch {
            // Fallback: compute from separate endpoints
            const [usersRes, bookingsRes] = await Promise.allSettled([
                apiGo.get<{ total?: number; meta?: { totalItems: number } }>('/users?limit=1'),
                apiGo.get<{ total?: number; meta?: { totalItems: number } }>('/bookings?limit=1'),
            ]);

            const totalUsers =
                usersRes.status === 'fulfilled'
                    ? (usersRes.value.data?.meta?.totalItems ?? usersRes.value.data?.total ?? 0)
                    : 0;
            const totalBookings =
                bookingsRes.status === 'fulfilled'
                    ? (bookingsRes.value.data?.meta?.totalItems ?? bookingsRes.value.data?.total ?? 0)
                    : 0;

            return {
                totalUsers,
                totalBookings,
                totalRevenue: 0,
                activeSubscriptions: 0,
                monthlyGrowth: { users: 0, bookings: 0, revenue: 0 },
            };
        }
    },
};

// ============================================================
// PAYMENTS
// ============================================================

export interface Payment {
    id: number;
    userId: string;
    userName?: string;
    amountCents: number;
    currency: string;
    status: string;
    provider: string;
    stripePaymentIntentId?: string;
    bookingId?: number;
    classEnrollmentId?: number;
    clubMembershipId?: number;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentsResponse {
    data: Payment[];
    meta: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        itemsPerPage: number;
    };
}

export const paymentsService = {
    getAll: async (params?: { page?: number; limit?: number }): Promise<PaymentsResponse> => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));
        const query = searchParams.toString();
        const response = await apiGo.get<PaymentsResponse>(`/payments${query ? `?${query}` : ''}`);
        return response.data;
    },
};

// ============================================================
// OPENING HOURS
// ============================================================

export interface DaySchedule {
    open: string;
    close: string;
    isClosed: boolean;
}

export interface OpeningHours {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
}

const DEFAULT_OPENING_HOURS: OpeningHours = {
    monday: { open: '07:00', close: '23:00', isClosed: false },
    tuesday: { open: '07:00', close: '23:00', isClosed: false },
    wednesday: { open: '07:00', close: '23:00', isClosed: false },
    thursday: { open: '07:00', close: '23:00', isClosed: false },
    friday: { open: '07:00', close: '23:00', isClosed: false },
    saturday: { open: '08:00', close: '22:00', isClosed: false },
    sunday: { open: '09:00', close: '21:00', isClosed: false },
};

export const openingHoursService = {
    get: async (): Promise<OpeningHours> => {
        try {
            const response = await apiGo.get<OpeningHours>('/settings/opening-hours');
            return response.data;
        } catch {
            return DEFAULT_OPENING_HOURS;
        }
    },
};
