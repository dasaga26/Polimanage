import { apiGo } from './api';
import type { Class, CreateClassDTO } from '@/types/classTypes';

export const classService = {
  // Obtener todas las clases
  getAll: async (): Promise<Class[]> => {
    const { data } = await apiGo.get<Class[]>('/classes');
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
