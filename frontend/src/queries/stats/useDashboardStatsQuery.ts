import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/otherServices';

export const useDashboardStatsQuery = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
    staleTime: 60_000, // 1 minuto
    retry: 1,
  });
};
