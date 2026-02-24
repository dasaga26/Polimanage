import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useClubsQuery } from '@/queries/clubs/useClubsQuery';
import { ClubShopCard } from '@/components/public/clubs/ClubShopCard';
import { SearchBar } from '@/components/public/shop/SearchBar';
import { Pagination } from '@/components/public/shop/Pagination';
import type { ClubQueryParams } from '@/types/clubTypes';

const SORT_OPTIONS = [
    { value: 'recientes', label: 'Más recientes' },
    { value: 'nombre_asc', label: 'Nombre A–Z' },
    { value: 'nombre_desc', label: 'Nombre Z–A' },
];

const STATUS_OPTIONS = [
    { value: '', label: 'Todos' },
    { value: 'active', label: 'Activos' },
];

const LIMIT = 9;

export default function ClubsPage() {
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('recientes');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);

    const debouncedSearch = useDebounce(search, 400);

    const params: ClubQueryParams = {
        page,
        limit: LIMIT,
        search: debouncedSearch || undefined,
        sort: sort as ClubQueryParams['sort'],
        status: (status as ClubQueryParams['status']) || undefined,
    };

    const { data, isLoading, isError } = useClubsQuery(params);

    const clubs = data?.data ?? [];
    const totalPages = data?.meta?.totalPages ?? 1;
    const totalItems = data?.meta?.totalItems ?? 0;

    // Reset page when filters change
    const handleSearch = (v: string) => { setSearch(v); setPage(1); };
    const handleSort = (v: string) => { setSort(v); setPage(1); };
    const handleStatus = (v: string) => { setStatus(v); setPage(1); };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Clubs Deportivos</h1>
                    <p className="text-lg text-gray-600">
                        Descubre y únete a los clubs que mejor se adaptan a ti
                    </p>
                </div>

                {/* Controles */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        {/* Búsqueda */}
                        <div className="flex-1 w-full">
                            <SearchBar
                                value={search}
                                onChange={handleSearch}
                                placeholder="Buscar clubs por nombre..."
                            />
                        </div>

                        {/* Filtro estado */}
                        <select
                            value={status}
                            onChange={(e) => handleStatus(e.target.value)}
                            className="h-14 px-4 pr-8 border-2 border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none cursor-pointer"
                        >
                            {STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>

                        {/* Ordenación */}
                        <select
                            value={sort}
                            onChange={(e) => handleSort(e.target.value)}
                            className="h-14 px-4 pr-8 border-2 border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none cursor-pointer"
                        >
                            {SORT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Resultado count */}
                    {!isLoading && totalItems > 0 && (
                        <p className="text-sm text-gray-500 mt-3">
                            {totalItems} club{totalItems !== 1 ? 's' : ''} encontrado{totalItems !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* Estados */}
                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: LIMIT }).map((_, i) => (
                            <div key={i} className="h-96 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                )}

                {isError && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No se pudieron cargar los clubs. Inténtalo de nuevo.</p>
                    </div>
                )}

                {!isLoading && !isError && clubs.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4 opacity-30">🏆</div>
                        <p className="text-xl font-semibold text-gray-700 mb-2">No hay clubs disponibles</p>
                        <p className="text-gray-500">Prueba a cambiar los filtros de búsqueda</p>
                        {(search || status) && (
                            <button
                                onClick={() => { handleSearch(''); handleStatus(''); }}
                                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                )}

                {!isLoading && !isError && clubs.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                            {clubs.map((club) => (
                                <ClubShopCard key={club.id} club={club} />
                            ))}
                        </div>
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
