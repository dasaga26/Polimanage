import { SearchBar } from './SearchBar';
import { SortSelect } from './SortSelect';
import { FiltersSidebar } from './FiltersSidebar';
import { PistaGrid } from './PistaGrid';
import { Pagination } from './Pagination';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';
import type { PistaPagedResponse } from '@/services/pistaService';

interface ShopManagerProps {
    data?: PistaPagedResponse;
    isLoading: boolean;
    isError: boolean;
    maxPriceLimit?: number;
    filters: {
        q: string;
        deporte: string;
        minPrice: string;
        maxPrice: string;
        sort: string;
        page: number;
    };
    onSearchChange: (value: string) => void;
    onDeporteChange: (value: string) => void;
    onPriceRangeChange: (min: string, max: string) => void;
    onSortChange: (value: string) => void;
    onPageChange: (page: number) => void;
    onResetFilters: () => void;
}

export function ShopManager({
    data,
    isLoading,
    isError,
    maxPriceLimit,
    filters,
    onSearchChange,
    onDeporteChange,
    onPriceRangeChange,
    onSortChange,
    onPageChange,
    onResetFilters,
}: ShopManagerProps) {
    return (
        <>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    Reserva tu Pista
                </h1>
                <p className="text-lg text-gray-600">
                    Encuentra y reserva la pista deportiva perfecta para ti
                </p>
            </div>
            {/* Controles */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Filtros móvil */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="lg:hidden shadow-sm">
                                <SlidersHorizontal className="h-4 w-4 mr-2" />
                                Filtros
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] overflow-y-auto">
                            <FiltersSidebar
                                deporte={filters.deporte}
                                minPrice={filters.minPrice}
                                maxPrice={filters.maxPrice}
                                maxPriceLimit={maxPriceLimit}
                                onDeporteChange={onDeporteChange}
                                onPriceRangeChange={onPriceRangeChange}
                                onReset={onResetFilters}
                            />
                        </SheetContent>
                    </Sheet>

                    {/* Búsqueda */}
                    <div className="flex-1">
                        <SearchBar
                            value={filters.q}
                            onChange={onSearchChange}
                            placeholder="Buscar por nombre o ubicación..."
                        />
                    </div>

                    {/* Ordenación */}
                    <SortSelect value={filters.sort} onChange={onSortChange} />
                </div>

                {/* Info de resultados */}
                {data && (
                    <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
                        <span className="text-sm text-gray-600">
                            Mostrando{' '}
                            <span className="font-semibold text-gray-900">
                                {data.items.length}
                            </span>{' '}
                            de{' '}
                            <span className="font-semibold text-gray-900">{data.total}</span> pistas
                        </span>
                        {filters.deporte && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium border border-blue-200">
                                {filters.deporte}
                            </span>
                        )}
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* Sidebar - Desktop (Hace scroll con la página) */}
                <aside className="hidden lg:block lg:col-span-1 relative">
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                        <FiltersSidebar
                            deporte={filters.deporte}
                            minPrice={filters.minPrice}
                            maxPrice={filters.maxPrice}
                            maxPriceLimit={maxPriceLimit}
                            onDeporteChange={onDeporteChange}
                            onPriceRangeChange={onPriceRangeChange}
                            onReset={onResetFilters}
                        />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="lg:col-span-4">


                    {/* Error */}
                    {isError && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center shadow-sm">
                            <div className="text-red-600 text-5xl mb-4">⚠️</div>
                            <p className="text-red-900 font-bold text-lg mb-2">
                                Error al cargar las pistas
                            </p>
                            <p className="text-red-700">
                                Por favor, intenta de nuevo más tarde
                            </p>
                        </div>
                    )}

                    {/* Grid de resultados */}
                    <PistaGrid pistas={data?.items || []} isLoading={isLoading} />

                    {/* Paginación */}
                    {data && data.total_pages > 1 && (
                        <div className="mt-10">
                            <Pagination
                                currentPage={filters.page}
                                totalPages={data.total_pages}
                                onPageChange={onPageChange}
                            />
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
