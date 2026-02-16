import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '@/services/subscriptionService';

export const useSuspendMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (membershipId: number) =>
      subscriptionService.suspendMembership(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

export const useResumeMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (membershipId: number) =>
      subscriptionService.resumeMembership(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

export const useCancelMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (membershipId: number) =>
      subscriptionService.cancelMembership(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

export const useUpdateBillingDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ membershipId, date }: { membershipId: number; date: string }) =>
      subscriptionService.updateBillingDate(membershipId, { nextBillingDate: date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};
