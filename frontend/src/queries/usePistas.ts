import { useQuery } from '@tanstack/react-query';
import { pistaService, type Pista } from '../services/pistaService';

export const usePistas = () => {
    return useQuery<Pista[], Error>({
        queryKey: ['pistas'],
        queryFn: pistaService.getAll,
    });
};
