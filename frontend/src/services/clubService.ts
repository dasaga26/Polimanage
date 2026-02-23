import { apiGo } from './api';
import type { Club, CreateClubData, UpdateClubData, ClubMembership, ClubQueryParams } from '@/types/clubTypes';
import type { PaginatedResponse } from '@/types/pagination';

export const clubService = {
  getAll: async (params?: ClubQueryParams): Promise<PaginatedResponse<Club>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sort) queryParams.append('sort', params.sort);

    const { data } = await apiGo.get(`/clubs?${queryParams.toString()}`);
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
