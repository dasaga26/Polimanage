import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clubService } from '@/services/clubService';

export const useAddMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clubSlug, userSlug }: { clubSlug: string; userSlug: string }) =>
      clubService.addMember(clubSlug, userSlug),
    onSuccess: (_, variables) => {
      // Invalidar la lista de clubs para actualizar memberCount
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      // Invalidar la query específica de miembros del club
      queryClient.invalidateQueries({ queryKey: ['club-members', variables.clubSlug] });
      // Invalidar todas las queries de club-members por si acaso
      queryClient.invalidateQueries({ queryKey: ['club-members'] });
      // Invalidar bookings y users para actualizar todas las vistas
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
