import { useQuery } from '@tanstack/react-query';
import { openingHourService } from '@/services/otherServices';
import type { OpeningHour } from '@/types/admin';

export const useOpeningHoursQuery = () => {
  return useQuery<OpeningHour[], Error>({
    queryKey: ['opening-hours'],
    queryFn: () => openingHourService.getAll(),
  });
};
