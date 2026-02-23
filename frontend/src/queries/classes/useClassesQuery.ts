import { useQuery } from '@tanstack/react-query';
import { classService } from '@/services/classService';
import type { ClassQueryParams } from '@/types/classTypes';

/**
 * Hook para obtener clases con paginación y filtros
 * @param params Parámetros de paginación y filtros
 */
export const useClassesQuery = (params?: ClassQueryParams) => {
  return useQuery({
    queryKey: ['classes', params],
    queryFn: () => classService.getAll(params),
    staleTime: 30000, // 30 segundos
  });
};

export const useClassesByPistaAndDateQuery = (pistaId: number, date: string) => {
  return useQuery({
    queryKey: ['classes', 'pista', pistaId, 'date', date],
    queryFn: () => classService.getByPistaAndDate(pistaId, date),
    enabled: !!pistaId && !!date,
  });
};
