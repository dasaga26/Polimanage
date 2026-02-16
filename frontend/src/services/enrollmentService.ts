import { apiGo } from './api';

export const enrollmentService = {
  // Eliminar una inscripción
  unenroll: async (enrollmentId: number): Promise<void> => {
    await apiGo.delete(`/enrollments/${enrollmentId}`);
  },
};
