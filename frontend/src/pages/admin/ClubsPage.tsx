import { useState, useMemo } from 'react';
import { useClubsQuery } from '@/queries/clubs/useClubsQuery';
import { ClubsHeader } from '@/components/admin/clubs/ClubsHeader';
import { ClubStats } from '@/components/admin/clubs/ClubStats';
import { ClubFilters } from '@/components/admin/clubs/ClubFilters';
import { ClubsTable } from '@/components/admin/clubs/ClubsTable';
import { CreateClubModal } from '@/components/admin/clubs/CreateClubModal';

export default function ClubsPage() {
    const { data: clubs = [], isLoading } = useClubsQuery();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const filteredClubs = useMemo(() => {
        return clubs.filter((club) => {
            const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || club.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [clubs, searchTerm, statusFilter]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando clubs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ClubsHeader onCreateClick={() => setIsCreateModalOpen(true)} />
            <ClubStats clubs={clubs} />
            <ClubFilters
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                onSearchChange={setSearchTerm}
                onStatusChange={setStatusFilter}
            />
            <ClubsTable clubs={filteredClubs} />
            <CreateClubModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </div>
    );
}
