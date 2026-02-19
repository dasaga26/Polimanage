import { apiGo } from './api';
import type { Club, CreateClubData, UpdateClubData, ClubMembership } from '@/types/clubTypes';

export const clubService = {
  getAll: async (): Promise<Club[]> => {
    const { data } = await apiGo.get('/clubs');
    return data;
  },

  getBySlug: async (slug: string): Promise<Club> => {
    const { data } = await apiGo.get(`/clubs/${slug}`);
    return data;
  },

  create: async (clubData: CreateClubData): Promise<Club> => {
    const { data } = await apiGo.post('/clubs', clubData);
    return data;
  },

  update: async (slug: string, clubData: UpdateClubData): Promise<Club> => {
    const { data } = await apiGo.put(`/clubs/${slug}`, clubData);
    return data;
  },

  delete: async (slug: string): Promise<void> => {
    await apiGo.delete(`/clubs/${slug}`);
  },

  getMembers: async (clubSlug: string): Promise<ClubMembership[]> => {
    const { data } = await apiGo.get(`/clubs/${clubSlug}/members`);
    return data;
  },

  addMember: async (clubSlug: string, userSlug: string): Promise<void> => {
    await apiGo.post(`/clubs/${clubSlug}/members`, { userSlug });
  },

  removeMember: async (membershipId: number): Promise<void> => {
    await apiGo.delete(`/clubs/memberships/${membershipId}`);
  },
};
