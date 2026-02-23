import { useDebounce } from '@/hooks/useDebounce';
import { useClassFilters } from '@/hooks/useClassFilters';
import { useClassesQuery } from '@/queries/classes/useClassesQuery';
import { ClassesManager } from '@/components/public/classes/ClassesManager';

export default function ClassesPage() {
  const {
    filters,
    setSearch,
    setDeporte,
    setPriceRange,
    setSort,
    setPage,
    resetFilters,
  } = useClassFilters();

  // Debounce para la búsqueda
  const debouncedSearch = useDebounce(filters.q, 500);

  // Query con paginación del servidor
  const { data, isLoading, isError } = useClassesQuery({
    page: filters.page,
    limit: 6,
    search: debouncedSearch,
    deporte: filters.deporte || undefined,
    min_price: filters.minPrice ? parseInt(filters.minPrice) * 100 : undefined,
    max_price: filters.maxPrice ? parseInt(filters.maxPrice) * 100 : undefined,
    sort: filters.sort && filters.sort !== 'recientes' ? filters.sort : undefined,
    status: 'active',
  });

  // Extraer datos de la respuesta paginada
  const paginatedClasses = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;
  const totalClasses = data?.meta?.totalItems || 0;
  const maxPriceLimit = data?.meta?.maxPriceLimitEur || undefined;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        <ClassesManager
          classes={paginatedClasses}
          totalClasses={totalClasses}
          currentPage={filters.page}
          totalPages={totalPages}
          isLoading={isLoading}
          isError={isError}
          maxPriceLimit={maxPriceLimit}
          filters={filters}
          onSearchChange={setSearch}
          onDeporteChange={setDeporte}
          onPriceRangeChange={setPriceRange}
          onSortChange={setSort}
          onPageChange={setPage}
          onResetFilters={resetFilters}
        />
      </div>
    </div>
  );
}
