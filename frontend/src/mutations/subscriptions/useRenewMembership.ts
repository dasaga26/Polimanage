import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService, type RenewMembershipData } from '@/services/subscriptionService';

export const useRenewMembership = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ membershipId, data }: { membershipId: number; data: RenewMembershipData }) =>
            subscriptionService.renewMembership(membershipId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        },
    });
};
