import { apiPython } from '@/config/axios';

export interface PublicClub {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
}

export const publicClubService = {
  getAll: async (): Promise<PublicClub[]> => {
    const { data } = await apiPython.get('/clubs');
    return data;
  },

  getById: async (id: number): Promise<PublicClub> => {
    const { data } = await apiPython.get(`/clubs/${id}`);
    return data;
  },
};
