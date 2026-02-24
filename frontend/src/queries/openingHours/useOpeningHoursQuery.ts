import { useQuery } from '@tanstack/react-query';
import { openingHoursService } from '@/services/otherServices';

export const useOpeningHoursQuery = () => {
  return useQuery({
    queryKey: ['opening-hours'],
    queryFn: () => openingHoursService.get(),
    staleTime: 5 * 60_000, // 5 minutos
  });
};
