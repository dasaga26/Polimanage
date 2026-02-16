import { SearchBar } from '../shop/SearchBar';
import { SortSelect } from '../shop/SortSelect';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';
import { ClassGrid } from './ClassGrid';
import { Pagination } from '../shop/Pagination';
import type { Class } from '@/types/classTypes';
import { FiltersSidebar } from '../shop/FiltersSidebar';

interface ClassesManagerProps {
  classes: Class[];
  totalClasses: number;
  currentPage: number;
  totalPages: number;
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

export function ClassesManager({
  classes,
  totalClasses,
  currentPage,
  totalPages,
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
}: ClassesManagerProps) {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Clases Disponibles
        </h1>
        <p className="text-lg text-gray-600">
          Inscríbete en las clases deportivas que más te interesen
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
              placeholder="Buscar por nombre, instructor o pista..."
            />
          </div>

          {/* Ordenación */}
          <SortSelect value={filters.sort} onChange={onSortChange} />
        </div>

        {/* Info de resultados */}
        <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm text-gray-600">
            Mostrando{' '}
            <span className="font-semibold text-gray-900">{classes.length}</span>{' '}
            de{' '}
            <span className="font-semibold text-gray-900">{totalClasses}</span>{' '}
            {totalClasses === 1 ? 'clase' : 'clases'}
          </span>
          {filters.deporte && (
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium border border-blue-200">
              {filters.deporte}
            </span>
          )}
        </div>
      </div>

      {/* Grid principal con sidebar */}
      <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-8">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block relative">
          <div className="sticky top-6">
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

        {/* Grid de clases */}
        <main>
          {isError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 font-semibold mb-2">Error al cargar las clases</p>
              <p className="text-red-600 text-sm">Por favor, intenta nuevamente más tarde</p>
            </div>
          ) : (
            <>
              <ClassGrid classes={classes} isLoading={isLoading} />
              
              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-10">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
