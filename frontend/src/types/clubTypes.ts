export type ClubStatus = 'ACTIVE' | 'INACTIVE' | 'FULL';

export interface Club {
  id: number;
  ownerId?: number;
  ownerSlug?: string;
  ownerName?: string;
  slug: string;
  name: string;
  description?: string;
  logoUrl?: string;
  maxMembers: number;
  monthlyFeeCents: number;
  monthlyFeeEuros: number;
  status: ClubStatus;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClubData {
  ownerSlug?: string;
  name: string;
  description?: string;
  logoUrl?: string;
  maxMembers: number;
  monthlyFeeCents: number;
  isActive: boolean;
}

export interface UpdateClubData {
  ownerSlug?: string;
  name: string;
  description?: string;
  logoUrl?: string;
  maxMembers: number;
  monthlyFeeCents: number;
  status: ClubStatus;
  isActive: boolean;
}

export type MembershipStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED';
export type PaymentStatus = 'UP_TO_DATE' | 'PAST_DUE';

export interface ClubMembership {
  id: number;
  clubId: number;
  clubSlug: string;
  clubName: string;
  userId: number;
  userSlug: string;
  userName: string;
  userEmail: string;
  status: MembershipStatus;
  startDate: string;
  endDate?: string;
  nextBillingDate?: string;
  paymentStatus: PaymentStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Para subscripciones futuras
export interface ClubSubscription {
  id: number;
  membershipId: number;
  stripeSubscriptionId?: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}
