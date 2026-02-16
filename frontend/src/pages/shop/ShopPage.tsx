import { useDebounce } from '@/hooks/useDebounce';
import { useShopFilters } from '@/hooks/useShopFilters';
import { usePistasAdvancedQuery, usePistasQuery } from '@/queries/pistas/usePistasQuery';
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

  // Debounce para la búsqueda
  const debouncedSearch = useDebounce(filters.q, 500);

  // Query con filtros
  const { data, isLoading, isError } = usePistasAdvancedQuery({
    q: debouncedSearch,
    deporte: filters.deporte || undefined,
    min_price: filters.minPrice ? parseInt(filters.minPrice) : undefined,
    max_price: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
    sort: filters.sort && filters.sort !== 'recientes' ? filters.sort : undefined,
    page: filters.page,
    limit: 6,
  });

  // Query para obtener TODAS las pistas (sin filtros) para calcular el máximo real
  const { data: allPistas } = usePistasQuery();
  const maxPriceLimit = allPistas && allPistas.length > 0
    ? Math.max(...allPistas.map(p => p.precioHoraBase))
    : undefined;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        <ShopManager
          data={data}
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