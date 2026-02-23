import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useClubsQuery } from '@/queries/clubs/useClubsQuery';
import { ClubsHeader } from '@/components/admin/clubs/ClubsHeader';
import { ClubStats } from '@/components/admin/clubs/ClubStats';
import { ClubFilters } from '@/components/admin/clubs/ClubFilters';
import { ClubsTable } from '@/components/admin/clubs/ClubsTable';
import { CreateClubModal } from '@/components/admin/clubs/CreateClubModal';
import { Pagination } from '@/components/public/shop/Pagination';

export default function ClubsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Debounce para la búsqueda
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Query con paginación del servidor
    const { data, isLoading } = useClubsQuery({
        page,
        limit: 10,
        search: debouncedSearch,
        status: statusFilter !== 'all' ? (statusFilter as 'active' | 'inactive') : undefined,
        sort: 'recientes',
    });

    // Query separada para las estadísticas (sin filtros)
    const { data: statsData } = useClubsQuery({ limit: 1000 });

    // Extraer datos de la respuesta paginada
    const clubs = data?.data || [];
    const totalPages = data?.meta?.totalPages || 1;
    const allClubs = statsData?.data || [];

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
            <ClubStats clubs={allClubs} />
            <ClubFilters
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                onSearchChange={setSearchTerm}
                onStatusChange={setStatusFilter}
            />
            <ClubsTable clubs={clubs} />
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
            <CreateClubModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </div>
    );
}
