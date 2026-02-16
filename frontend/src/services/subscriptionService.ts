import { apiGo } from '@/config/axios';
import type { ClubMembership, Club } from '@/types/clubTypes';

export interface RenewMembershipData {
  customerId: string;
}

export interface UpdateBillingDateData {
  nextBillingDate: string; // ISO string
}

export const subscriptionService = {
  // Obtener todas las membresías activas de todos los clubs
  getAllMemberships: async (): Promise<ClubMembership[]> => {
    // Primero obtener todos los clubs
    const { data: clubs } = await apiGo.get<Club[]>('/clubs');
    
    // Luego obtener membresías de cada club
    const membershipPromises = clubs.map(async (club) => {
      try {
        const { data } = await apiGo.get<ClubMembership[]>(`/clubs/${club.slug}/members`);
        return data;
      } catch (error) {
        console.error(`Error fetching members for ${club.slug}:`, error);
        return [];
      }
    });

    const membershipArrays = await Promise.all(membershipPromises);
    return membershipArrays.flat();
  },

  // Renovar membresía procesando el pago
  renewMembership: async (membershipId: number, data: RenewMembershipData): Promise<void> => {
    await apiGo.post(`/clubs/memberships/${membershipId}/renew`, data);
  },

  // Suspender membresía
  suspendMembership: async (membershipId: number): Promise<void> => {
    await apiGo.post(`/clubs/memberships/${membershipId}/suspend`);
  },

  // Reanudar membresía
  resumeMembership: async (membershipId: number): Promise<void> => {
    await apiGo.post(`/clubs/memberships/${membershipId}/resume`);
  },

  // Cancelar membresía
  cancelMembership: async (membershipId: number): Promise<void> => {
    await apiGo.post(`/clubs/memberships/${membershipId}/cancel`);
  },

  // Actualizar fecha de cobro
  updateBillingDate: async (membershipId: number, data: UpdateBillingDateData): Promise<void> => {
    await apiGo.put(`/clubs/memberships/${membershipId}/billing-date`, data);
  },
};
