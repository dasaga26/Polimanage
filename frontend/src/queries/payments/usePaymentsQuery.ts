import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/services/otherServices';

export const usePaymentsQuery = () => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentService.getAll(),
  });
};
