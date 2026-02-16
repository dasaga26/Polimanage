// Tipos para el módulo de administración

// Booking types
export interface Booking {
  id: number;
  userId: number;
  userName: string;
  pistaId: number;
  pistaName: string;
  pistaType: string;
  startTime: string;
  endTime: string;
  priceSnapshotCents: number;
  priceSnapshotEuros: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  notes?: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
  pista?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Payment types
export interface Payment {
  id: number;
  userId: number;
  amountCents: number;
  status: 'SUCCEEDED' | 'PENDING' | 'FAILED';
  provider: string;
  bookingId?: number | null;
  classEnrollmentId?: number | null;
  tournamentId?: number | null;
  subscriptionId?: number | null;
  user?: {
    id: number;
    fullName: string;
  };
  createdAt?: string;
}

// OpeningHour types
export interface OpeningHour {
  id: number;
  dayOfWeek: number; // 0=Domingo, 6=Sábado
  openTime: string; // HH:MM formato
  closeTime: string; // HH:MM formato
  isActive: boolean;
}

// Class types
export interface Class {
  id: number;
  title?: string;
  name: string;
  instructorId: number;
  pistaId: number;
  maxCapacity?: number;
  capacity?: number;
  priceCents: number;
  startTime: string;
  endTime: string;
  status?: 'OPEN' | 'FULL' | 'CANCELLED' | 'COMPLETED';
  isActive: boolean;
  instructor?: {
    id: number;
    fullName: string;
  };
  pista?: {
    id: number;
    name: string;
  };
}

// Team types
export interface Team {
  id: number;
  name: string;
  slug: string;
  creatorId?: number;
  captainId?: number;
  maxMembers: number;
  logoUrl?: string;
  description?: string;
  level?: string;
  isActive: boolean;
  captain?: {
    id: number;
    fullName: string;
  };
}

// Tournament types
export interface Tournament {
  id: number;
  name: string;
  slug: string;
  organizerId: number;
  pistaId: number;
  startDate: string;
  endDate: string;
  maxTeams: number;
  entryFeeCents: number;
  prizeCents: number;
  status: string;
  isActive: boolean;
}

// Subscription types
export interface Subscription {
  id: number;
  user?: {
    id: number;
    fullName: string;
  };
  plan?: {
    id: number;
    name: string;
  };
  userId: number;
  planId: number;
  status: 'ACTIVE' | 'CANCELED' | 'EXPIRED';
  startDate: string;
  endDate?: string;
  stripeSubscriptionId?: string;
}
