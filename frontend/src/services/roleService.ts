import { apiGo } from './api';

export interface Role {
  id: number;
  name: string;
  description: string;
}

export const roleService = {
  getAll: async (): Promise<Role[]> => {
    const { data } = await apiGo.get<Role[]>('/roles');
    return data;
  },
};
