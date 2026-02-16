// TODO: Implementar cuando exista endpoint en backend
export const statsService = {
  getDashboard: async () => ({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    monthlyGrowth: {
      users: 0,
      bookings: 0,
      revenue: 0,
    },
  }),
};

export const bookingService = {
  getAll: async () => [],
  delete: async (_id: number) => {},
};

export const classService = {
  getAll: async () => [],
  delete: async (_id: number) => {},
};

export const teamService = {
  getAll: async () => [],
  delete: async (_id: number) => {},
};

export const tournamentService = {
  getAll: async () => [],
  delete: async (_id: number) => {},
};

export const subscriptionService = {
  getAll: async () => [],
};

export const paymentService = {
  getAll: async () => [],
};

export const openingHourService = {
  getAll: async () => [],
  update: async (_id: number, _data: any) => ({}),
};
