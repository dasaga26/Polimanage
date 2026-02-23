import { useQuery } from '@tanstack/react-query';
import { pistaService, type Pista, type PistaQueryParams } from '../services/pistaService';
import type { PaginatedResponse } from '../types/pagination';

/**
 * Hook para obtener pistas con paginación y filtros
 * @param params Parámetros de paginación y filtros
 */
export const usePistas = (params?: PistaQueryParams) => {
    return useQuery<PaginatedResponse<Pista>, Error>({
        queryKey: ['pistas', params],
        queryFn: () => pistaService.getAll(params),
        staleTime: 30000, // 30 segundos
    });
};
