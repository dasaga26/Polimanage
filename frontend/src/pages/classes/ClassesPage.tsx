import { useDebounce } from '@/hooks/useDebounce';
import { useClassFilters } from '@/hooks/useClassFilters';
import { useClassesQuery } from '@/queries/classes/useClassesQuery';
import { ClassesManager } from '@/components/public/classes/ClassesManager';
import { useMemo } from 'react';

const ITEMS_PER_PAGE = 6;

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

  // Query para obtener todas las clases
  const { data: allClasses = [], isLoading, isError } = useClassesQuery();

  // Calcular el precio máximo de todas las clases
  const maxPriceLimit = useMemo(() => {
    if (!allClasses || allClasses.length === 0) return undefined;
    return Math.max(...allClasses.map(c => c.priceCents / 100));
  }, [allClasses]);

  // Filtrar y ordenar clases en el cliente
  const filteredClasses = useMemo(() => {
    let result = [...allClasses];

    // Filtrar clases finalizadas y canceladas
    result = result.filter(c => 
      c.status !== 'COMPLETED' && 
      c.status !== 'CANCELLED' &&
      c.isActive !== false
    );

    // Filtro de búsqueda
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(c => 
        c.name?.toLowerCase().includes(searchLower) ||
        c.title?.toLowerCase().includes(searchLower) ||
        c.instructorName?.toLowerCase().includes(searchLower) ||
        c.pistaName?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de deporte (basado en el nombre de la pista)
    if (filters.deporte) {
      result = result.filter(c => 
        c.pistaName?.toLowerCase().includes(filters.deporte.toLowerCase())
      );
    }

    // Filtro de precio
    if (filters.minPrice) {
      const minPrice = parseInt(filters.minPrice) * 100; // Convertir a céntimos
      result = result.filter(c => c.priceCents >= minPrice);
    }
    if (filters.maxPrice) {
      const maxPrice = parseInt(filters.maxPrice) * 100; // Convertir a céntimos
      result = result.filter(c => c.priceCents <= maxPrice);
    }

    // Ordenación
    switch (filters.sort) {
      case 'precio_asc':
        result.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case 'precio_desc':
        result.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case 'nombre_asc':
        result.sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
        break;
      case 'nombre_desc':
        result.sort((a, b) => (b.title || b.name || '').localeCompare(a.title || a.name || ''));
        break;
      case 'recientes':
      default:
        result.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        break;
    }

    return result;
  }, [allClasses, debouncedSearch, filters]);

  // Paginación
  const totalPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE);
  const startIndex = (filters.page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        <ClassesManager
          classes={paginatedClasses}
          totalClasses={filteredClasses.length}
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
