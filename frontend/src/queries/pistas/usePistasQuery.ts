import { useQuery } from '@tanstack/react-query';
import { pistaService, type PistaQueryParams } from '@/services/pistaService';

/**
 * Hook para obtener pistas con paginación y filtros
 * @param params Parámetros de paginación y filtros
 */
export const usePistasQuery = (params?: PistaQueryParams) => {
  return useQuery({
    queryKey: ['pistas', params],
    queryFn: () => pistaService.getAll(params),
    staleTime: 30000, // 30 segundos
  });
};

/**
 * DEPRECATED: Usar usePistasQuery con params en su lugar
 */
export const usePistasAdvancedQuery = (params: PistaQueryParams) => {
  return useQuery({
    queryKey: ['pistas', 'advanced', params],
    queryFn: ({ signal }) => pistaService.getAllAdvanced(params, signal),
    staleTime: 30000, // 30 segundos
  });
};

export const usePistaQuery = (id: number) => {
  return useQuery({
    queryKey: ['pistas', id],
    queryFn: () => pistaService.getById(id),
    enabled: !!id,
  });
};

