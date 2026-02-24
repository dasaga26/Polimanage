import { useDebounce } from '@/hooks/useDebounce';
import { useShopFilters } from '@/hooks/useShopFilters';
import { usePistasQuery } from '@/queries/pistas/usePistasQuery';
import { ShopManager } from '@/components/public/shop/ShopManager';

export default function ShopPage() {
  const {
    filters,
    setSearch,
    setDeporte,
    setPriceRange,
    setSort,
    setPage,
    resetFilters,
  } = useShopFilters();

  const debouncedSearch = useDebounce(filters.q, 500);

  // Query con paginación del servidor
  const { data, isLoading, isError } = usePistasQuery({
    page: filters.page,
    limit: 6,
    search: debouncedSearch,
    deporte: filters.deporte || undefined,
    min_price: filters.minPrice ? parseInt(filters.minPrice) * 100 : undefined,
    max_price: filters.maxPrice ? parseInt(filters.maxPrice) * 100 : undefined,
    sort: filters.sort && filters.sort !== 'recientes' ? filters.sort : undefined,
  });

  // Extraer datos de la respuesta paginada
  const paginatedPistas = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;
  const totalPistas = data?.meta?.totalItems || 0;
  const maxPriceLimit = data?.meta?.maxPriceLimitEur || undefined;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        <ShopManager
          pistas={paginatedPistas}
          totalPistas={totalPistas}
          currentPage={filters.page}
          totalPages={totalPages}
          isLoading={isLoading}
          isError={isError}
          filters={filters}
          maxPriceLimit={maxPriceLimit}
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