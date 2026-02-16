import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { MultiUserSelector } from '@/components/ui/MultiUserSelector';
import { useUsersQuery } from '@/queries/users/useUsersQuery';
import { useUnenrollStudent } from '@/mutations/enrollments/useUnenrollStudent';
import { useEnrollStudent } from '@/mutations/classes/useEnrollStudent';
import type { Class } from '@/types/classTypes';
import { UserPlus, X, Trash2 } from 'lucide-react';
import { showConfirm, showSuccess, showError, showWarning } from '@/lib/alerts';

export interface EnrollmentManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedClass: Class | null;
}

export function EnrollmentManagerModal({
    isOpen,
    onClose,
    selectedClass,
}: EnrollmentManagerModalProps) {
    const { data: allUsers = [] } = useUsersQuery();
    const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false);
    const enrollMutation = useEnrollStudent();
    const unenrollMutation = useUnenrollStudent();

    // Filtrar solo clientes (CLIENTE = role_id 5)
    const clients = allUsers.filter((u) => u.roleId === 5);

    // Calcular espacios disponibles
    const currentEnrolled = selectedClass?.enrollments?.length || 0;
    const maxCapacity = selectedClass?.maxCapacity || selectedClass?.capacity || 0;
    const availableSpots = Math.max(0, maxCapacity - currentEnrolled);

    // IDs y Slugs de usuarios ya inscritos (usar ambos para mayor seguridad)
    const enrolledUserSlugs = new Set(
        selectedClass?.enrollments?.map((e) => e.userSlug).filter(Boolean) || []
    );
    const enrolledUserIds = new Set(
        selectedClass?.enrollments?.map((e) => e.userId).filter(Boolean) || []
    );

    // Clientes disponibles para inscribir (no inscritos aún)
    const availableClients = clients.filter(
        (c) => !enrolledUserSlugs.has(c.slug) && !enrolledUserIds.has(c.id)
    );

    const handleEnrollUsers = async (userSlugs: string[]) => {
        if (!selectedClass) return;

        // Validar capacidad disponible ANTES de intentar inscribir
        const currentEnrolled = selectedClass.enrollments?.length || 0;
        const maxCapacity = selectedClass.maxCapacity || selectedClass.capacity || 0;
        const availableSpots = maxCapacity - currentEnrolled;

        if (userSlugs.length > availableSpots) {
            showError(
                'Capacidad insuficiente',
                `Solo hay ${availableSpots} ${availableSpots === 1 ? 'espacio disponible' : 'espacios disponibles'}. Intentas inscribir ${userSlugs.length} ${userSlugs.length === 1 ? 'alumno' : 'alumnos'}.`
            );
            return;
        }

        try {
            // Inscribir usuarios uno por uno para mejor control de errores
            let successCount = 0;
            let errorMessages: string[] = [];

            for (const slug of userSlugs) {
                try {
                    await enrollMutation.mutateAsync({ classSlug: selectedClass.slug, userSlug: slug });
                    successCount++;
                } catch (error: any) {
                    const userName = availableClients.find(u => u.slug === slug)?.fullName || 'Usuario';
                    const errorMsg = error?.response?.data?.error || 'Error desconocido';
                    errorMessages.push(`${userName}: ${errorMsg}`);
                }
            }

            if (successCount > 0 && errorMessages.length === 0) {
                // Todos inscritos correctamente
                showSuccess(
                    'Alumnos inscritos',
                    `Se han inscrito ${successCount} ${successCount === 1 ? 'alumno' : 'alumnos'} exitosamente`
                );
                setIsMultiSelectOpen(false);
            } else if (successCount > 0 && errorMessages.length > 0) {
                // Algunos inscritos, algunos con error
                showWarning(
                    'Inscripción parcial',
                    `${successCount} inscritos correctamente. Errores:\n${errorMessages.join('\n')}`
                );
                setIsMultiSelectOpen(false);
            } else {
                // Ninguno inscrito
                showError(
                    'Error al inscribir alumnos',
                    errorMessages.length > 0 ? errorMessages.join('\n') : 'No se pudo inscribir a ningún alumno'
                );
            }
        } catch (error: any) {
            showError('Error inesperado', error?.message || 'Ocurrió un error al procesar las inscripciones');
        }
    };

    const handleUnenroll = async (enrollmentId: number, userName: string) => {
        const confirmed = await showConfirm(
            '¿Eliminar inscripción?',
            `Se eliminará a ${userName} de esta clase`
        );

        if (!confirmed) return;

        try {
            await unenrollMutation.mutateAsync(enrollmentId);
            showSuccess('Inscripción eliminada', `${userName} ha sido eliminado de la clase`);
        } catch (error: any) {
            showError('Error al eliminar inscripción', error?.response?.data?.error || 'No se pudo eliminar la inscripción');
        }
    };

    if (!selectedClass) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Gestionar Inscripciones - {selectedClass.title || selectedClass.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Información de la clase */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                            <span className="font-medium">Pista:</span>
                            <span>{selectedClass.pistaName || selectedClass.pista?.nombre || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Monitor:</span>
                            <span>{selectedClass.instructorName || selectedClass.instructor?.fullName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Ocupación:</span>
                            <span className={`font-semibold ${
                                currentEnrolled >= maxCapacity 
                                    ? 'text-red-600' 
                                    : currentEnrolled >= maxCapacity * 0.8
                                    ? 'text-yellow-600'
                                    : 'text-green-600'
                            }`}>
                                {currentEnrolled} / {maxCapacity}
                                {currentEnrolled >= maxCapacity && ' (COMPLETA)'}
                            </span>
                        </div>
                    </div>

                    {/* Lista de alumnos inscritos */}
                    <div>
                        <h3 className="font-semibold mb-3">Alumnos Inscritos</h3>
                        {selectedClass.enrollments && selectedClass.enrollments.length > 0 ? (
                            <div className="border rounded-lg divide-y">
                                {selectedClass.enrollments.map((enrollment) => (
                                    <div
                                        key={enrollment.id}
                                        className="flex items-center justify-between p-3 hover:bg-gray-50"
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium">
                                                {enrollment.userName || enrollment.user?.fullName || 'Usuario sin nombre'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {enrollment.userEmail || enrollment.user?.email || ''}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm text-gray-500">
                                                Inscrito:{' '}
                                                {new Date(enrollment.enrolledAt).toLocaleDateString('es-ES')}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleUnenroll(
                                                    enrollment.id,
                                                    enrollment.userName || enrollment.user?.fullName || 'el usuario'
                                                )}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-500 border rounded-lg">
                                No hay alumnos inscritos
                            </div>
                        )}
                    </div>

                    {/* Añadir nuevo alumno */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Inscribir Alumnos</h3>
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-500">
                                    {availableClients.length} clientes disponibles
                                </p>
                                {availableSpots > 0 && (
                                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                        availableSpots <= 3
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-green-100 text-green-700'
                                    }`}>
                                        {availableSpots} {availableSpots === 1 ? 'espacio' : 'espacios'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsMultiSelectOpen(true)}
                            disabled={availableClients.length === 0 || availableSpots === 0}
                            className="w-full"
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            {availableSpots === 0 
                                ? 'Clase Completa' 
                                : 'Seleccionar Alumnos para Inscribir'}
                        </Button>
                        {availableSpots === 0 && availableClients.length > 0 && (
                            <p className="text-xs text-red-600 mt-2 text-center">
                                La clase ha alcanzado su capacidad máxima
                            </p>
                        )}
                    </div>

                    {/* Multi-Select Modal */}
                    <MultiUserSelector
                        isOpen={isMultiSelectOpen}
                        onClose={() => setIsMultiSelectOpen(false)}
                        availableUsers={availableClients}
                        onAddUsers={handleEnrollUsers}
                        maxSelection={availableSpots}
                        title={`Inscribir Alumnos - ${selectedClass.title || selectedClass.name}`}
                        description={`Selecciona uno o varios clientes para inscribir en esta clase (${availableSpots} ${availableSpots === 1 ? 'espacio disponible' : 'espacios disponibles'})`}
                        isPending={enrollMutation.isPending}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        <X className="h-4 w-4 mr-2" />
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
