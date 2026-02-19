import { apiGo } from './api';

export interface User {
  id: string; // UUID
  roleId: number;
  slug: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  stripeCustomerId?: string;
  isActive: boolean;
  roleName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  roleId: number;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface UpdateUserDTO {
  roleId?: number;
  fullName?: string;
  phone?: string;
  isActive?: boolean;
}

export const userService = {
  getAll: async (roleId?: number): Promise<User[]> => {
    const params = roleId ? { role_id: roleId } : {};
    const { data } = await apiGo.get<User[]>('/users', { params });
    return data;
  },

  getBySlug: async (slug: string): Promise<User> => {
    const { data } = await apiGo.get<User>(`/users/${slug}`);
    return data;
  },

  create: async (userData: CreateUserDTO): Promise<User> => {
    const { data } = await apiGo.post<User>('/users', userData);
    return data;
  },

  update: async (slug: string, userData: UpdateUserDTO): Promise<User> => {
    const { data } = await apiGo.put<User>(`/users/${slug}`, userData);
    return data;
  },

  delete: async (slug: string): Promise<void> => {
    await apiGo.delete(`/users/${slug}`);
  },
};
