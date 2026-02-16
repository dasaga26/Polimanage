import { useQuery } from '@tanstack/react-query';
import { classService } from '@/services/classService';

export const useClassesQuery = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAll(),
  });
};

export const useClassesByPistaAndDateQuery = (pistaId: number, date: string) => {
  return useQuery({
    queryKey: ['classes', 'pista', pistaId, 'date', date],
    queryFn: () => classService.getByPistaAndDate(pistaId, date),
    enabled: !!pistaId && !!date,
  });
};
