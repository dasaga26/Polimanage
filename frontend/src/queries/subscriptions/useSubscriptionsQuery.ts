import { useQuery } from '@tanstack/react-query';
import { subscriptionService } from '@/services/subscriptionService';

export const useSubscriptionsQuery = () => {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: subscriptionService.getAllMemberships,
  });
};
