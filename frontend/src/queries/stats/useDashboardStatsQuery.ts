import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/services/otherServices';

export const useDashboardStatsQuery = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => statsService.getDashboard(),
  });
};
