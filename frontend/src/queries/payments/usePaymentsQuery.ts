import { useQuery } from '@tanstack/react-query';
import { paymentsService } from '@/services/otherServices';

export const usePaymentsQuery = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => paymentsService.getAll(params),
    staleTime: 30_000,
  });
};
