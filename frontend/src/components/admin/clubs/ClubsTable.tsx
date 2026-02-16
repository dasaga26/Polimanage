import { useState } from 'react';
import { Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteClub } from '@/mutations/clubs/useDeleteClub';
import { showConfirm, showSuccess, showError } from '@/lib/alerts';
import { EditClubModal } from './EditClubModal';
import { MembersModal } from './MembersModal';
import type { Club } from '@/types/clubTypes';

interface ClubsTableProps {
    clubs: Club[];
}

export function ClubsTable({ clubs }: ClubsTableProps) {
    const deleteMutation = useDeleteClub();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);

    const handleEdit = (club: Club) => {
        setSelectedClub(club);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (club: Club) => {
        const confirmed = await showConfirm(
            '¿Eliminar club?',
            `Se eliminará el club "${club.name}". Esta acción no se puede deshacer.`
        );

        if (!confirmed) return;

        try {
            await deleteMutation.mutateAsync(club.slug);
            showSuccess('Club eliminado', `El club "${club.name}" ha sido eliminado correctamente`);
        } catch (error: any) {
            showError('Error al eliminar', error?.response?.data?.error || 'No se pudo eliminar el club');
        }
    };

    const handleViewMembers = (club: Club) => {
        setSelectedClub(club);
        setIsMembersModalOpen(true);
    };

    const getStatusBadge = (status: string, isActive: boolean) => {
        if (!isActive) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">Inactivo</span>;
        }

        const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
            ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', label: 'Activo' },
            INACTIVE: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Inactivo' },
            FULL: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Completo' },
        };

        const config = statusConfig[status] || statusConfig.ACTIVE;
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Club
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cuota Mensual
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Miembros
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {clubs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron clubs
                                    </td>
                                </tr>
                            ) : (
                                clubs.map((club) => (
                                    <tr key={club.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {club.logoUrl ? (
                                                    <img src={club.logoUrl} alt={club.name} className="h-10 w-10 rounded-full" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-blue-600 font-semibold text-lg">
                                                            {club.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{club.name}</div>
                                                    {club.description && (
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">{club.description}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-semibold">{club.monthlyFeeEuros.toFixed(2)} €</div>
                                            <div className="text-xs text-gray-500">por mes</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {club.memberCount} / {club.maxMembers}
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${(club.memberCount / club.maxMembers) * 100}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(club.status, club.isActive)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewMembers(club)}
                                                    className="text-purple-600 hover:text-purple-700"
                                                >
                                                    <Users className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(club)}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(club)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <EditClubModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedClub(null);
                }}
                club={selectedClub}
            />
            <MembersModal
                isOpen={isMembersModalOpen}
                onClose={() => {
                    setIsMembersModalOpen(false);
                    setSelectedClub(null);
                }}
                club={selectedClub}
            />
        </>
    );
}
