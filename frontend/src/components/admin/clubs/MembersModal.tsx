import { useState } from 'react';
import { X, Trash2, CreditCard, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MultiUserSelector } from '@/components/ui/MultiUserSelector';
import { useClubMembersQuery } from '@/queries/clubs/useClubsQuery';
import { useAddMember } from '@/mutations/clubs/useAddMember';
import { useRemoveMember } from '@/mutations/clubs/useRemoveMember';
import { useUsersQuery } from '@/queries/users/useUsersQuery';
import { showConfirm, showSuccess, showError } from '@/lib/alerts';
import type { Club } from '@/types/clubTypes';

interface MembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    club: Club | null;
}

export function MembersModal({ isOpen, onClose, club }: MembersModalProps) {
    const { data: members = [], isLoading } = useClubMembersQuery(club?.slug || '');
    const { data: usersData } = useUsersQuery({ limit: 1000 });
    const allUsers = usersData?.data || [];
    const addMemberMutation = useAddMember();
    const removeMutation = useRemoveMember();
    const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false);

    // Filtrar solo clientes (CLIENTE = roleId 5)
    const clients = allUsers.filter((u) => u.roleId === 5 && u.isActive);

    // Set de usuarios ya miembros (por slug y ID para mayor robustez)
    const memberUserSet = new Set(
        members.flatMap((m) => [m.userSlug, m.userId?.toString()].filter(Boolean))
    );

    // Clientes disponibles para añadir (no son miembros aún)
    const availableClients = clients.filter(
        (c) => !memberUserSet.has(c.slug) && !memberUserSet.has(c.id.toString())
    );

    const handleAddMembers = async (userSlugs: string[]) => {
        if (!club) return;

        try {
            // Añadir todos los usuarios seleccionados
            const promises = userSlugs.map((slug) =>
                addMemberMutation.mutateAsync({ clubSlug: club.slug, userSlug: slug })
            );
            
            await Promise.all(promises);
            
            showSuccess(
                'Miembros añadidos',
                `Se han añadido ${userSlugs.length} ${userSlugs.length === 1 ? 'miembro' : 'miembros'} al club`
            );
            setIsMultiSelectOpen(false);
        } catch (error: any) {
            showError('Error al añadir miembros', error?.response?.data?.error || 'No se pudieron añadir algunos miembros');
        }
    };

    const handleRemoveMember = async (membershipId: number, userName: string) => {
        const confirmed = await showConfirm(
            '¿Eliminar miembro?',
            `Se eliminará a ${userName} del club. Esta acción no se puede deshacer.`
        );

        if (!confirmed) return;

        try {
            await removeMutation.mutateAsync(membershipId);
            showSuccess('Miembro eliminado', `${userName} ha sido eliminado del club`);
        } catch (error: any) {
            showError('Error al eliminar', error?.response?.data?.error || 'No se pudo eliminar el miembro');
        }
    };

    const handleManageSubscription = () => {
        // TODO: Implementar gestión de subscripciones
        showError('Función pendiente', 'La gestión de subscripciones estará disponible próximamente');
    };

    const getStatusBadge = (status: string, isActive: boolean) => {
        if (!isActive) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">Inactivo</span>;
        }

        const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
            ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', label: 'Activo' },
            SUSPENDED: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Suspendido' },
            EXPIRED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expirado' },
            CANCELLED: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Cancelado' },
        };

        const config = statusConfig[status] || statusConfig.ACTIVE;
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    if (!club) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Miembros de {club.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-600">Miembros Actuales</p>
                                <p className="text-2xl font-bold text-blue-600">{club.memberCount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Capacidad Máxima</p>
                                <p className="text-2xl font-bold text-gray-900">{club.maxMembers}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Disponibles</p>
                                <p className="text-2xl font-bold text-green-600">{club.maxMembers - club.memberCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Añadir Miembro */}
                    {availableClients.length > 0 && club.memberCount < club.maxMembers && (
                        <div className="bg-white p-4 rounded-lg border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">Añadir Miembros</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {availableClients.length} clientes disponibles
                                    </p>
                                </div>
                                <Button onClick={() => setIsMultiSelectOpen(true)}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Seleccionar Usuarios
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Multi-Select Modal */}
                    <MultiUserSelector
                        isOpen={isMultiSelectOpen}
                        onClose={() => setIsMultiSelectOpen(false)}
                        availableUsers={availableClients}
                        onAddUsers={handleAddMembers}
                        title={`Añadir Miembros a ${club.name}`}
                        description={`Selecciona uno o varios clientes para añadir al club (${club.maxMembers - club.memberCount} espacios disponibles)`}
                        isPending={addMemberMutation.isPending}
                    />

                    {/* Members List */}
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Cargando miembros...</p>
                        </div>
                    ) : members.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No hay miembros en este club todavía</p>
                        </div>
                    ) : (
                        <div className="border rounded-lg divide-y">
                            {members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold">
                                                    {member.userName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{member.userName}</div>
                                                <div className="text-sm text-gray-500">{member.userEmail}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">
                                                Desde: {new Date(member.startDate).toLocaleDateString('es-ES')}
                                            </div>
                                            <div className="mt-1">{getStatusBadge(member.status, member.isActive)}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleManageSubscription}
                                                className="text-indigo-600 hover:text-indigo-700"
                                                title="Gestionar subscripción (próximamente)"
                                            >
                                                <CreditCard className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveMember(member.id, member.userName)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
