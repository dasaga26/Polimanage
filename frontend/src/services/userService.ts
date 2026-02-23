import { apiGo } from './api';
import type { PaginatedResponse, PaginationParams } from '@/types/pagination';

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

export interface UserQueryParams extends PaginationParams {
  // Heredamos: page, limit, search, sort, status
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
  getAll: async (params?: UserQueryParams): Promise<PaginatedResponse<User>> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.sort) searchParams.set('sort', params.sort);
    
    const queryString = searchParams.toString();
    const url = queryString ? `/users?${queryString}` : '/users';
    
    const { data } = await apiGo.get<PaginatedResponse<User>>(url);
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
