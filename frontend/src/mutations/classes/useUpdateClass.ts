import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classService } from '@/services/classService';
import type { CreateClassDTO } from '@/types/classTypes';

interface UpdateClassParams {
    slug: string;
    data: CreateClassDTO;
}

export const useUpdateClass = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ slug, data }: UpdateClassParams) => classService.update(slug, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
};
