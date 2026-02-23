import { apiGo } from './api';
import type { Class, CreateClassDTO, ClassQueryParams } from '@/types/classTypes';
import type { PaginatedResponse } from '@/types/pagination';

export const classService = {
  // Obtener todas las clases con paginación y filtros
  getAll: async (params?: ClassQueryParams): Promise<PaginatedResponse<Class>> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.deporte) searchParams.set('deporte', params.deporte);
    if (params?.min_price !== undefined) searchParams.set('min_price', String(params.min_price));
    if (params?.max_price !== undefined) searchParams.set('max_price', String(params.max_price));

    const queryString = searchParams.toString();
    const url = queryString ? `/classes?${queryString}` : '/classes';
    
    const { data } = await apiGo.get<PaginatedResponse<Class>>(url);
    return data;
  },

  // Crear nueva clase
  create: async (classData: CreateClassDTO): Promise<Class> => {
    const { data } = await apiGo.post<Class>('/classes', classData);
    return data;
  },

  // Actualizar una clase existente
  update: async (slug: string, classData: CreateClassDTO): Promise<Class> => {
    const { data } = await apiGo.put<Class>(`/classes/${slug}`, classData);
    return data;
  },

  // Inscribir un alumno en una clase
  enroll: async (classSlug: string, userSlug: string): Promise<void> => {
    await apiGo.post(`/classes/${classSlug}/enroll`, { user_slug: userSlug });
  },

  // Obtener clases de una pista en una fecha específica
  getByPistaAndDate: async (pistaId: number, date: string): Promise<Class[]> => {
    // Backend Go no tiene este endpoint, simular filtrando getAll por ahora
    // TODO: Implementar endpoint /classes/pista/${pistaId}/date/${date}
    const { data } = await apiGo.get<Class[]>('/classes');
    return data.filter(c => {
      if (c.pistaId !== pistaId) return false;
      const classDate = new Date(c.startTime).toISOString().split('T')[0];
      return classDate === date && c.status !== 'CANCELLED';
    });
  },

  // Eliminar una clase
  delete: async (slug: string): Promise<void> => {
    await apiGo.delete(`/classes/${slug}`);
  },
};
