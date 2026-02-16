import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

export interface ClassFilters {
  q: string;
  deporte: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  page: number;
}

export function useClassFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Leer valores directamente de la URL en cada render
  const filters: ClassFilters = {
    q: searchParams.get('q') || '',
    deporte: searchParams.get('deporte') || '',
    minPrice: searchParams.get('min_price') || '',
    maxPrice: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || '',
    page: parseInt(searchParams.get('page') || '1', 10),
  };

  // Helper para actualizar parámetros
  const updateParams = useCallback((updates: Record<string, string | number | null>) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 0) {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });
      
      return newParams;
    }, { replace: true });
  }, [setSearchParams]);

  // Setters individuales
  const setSearch = useCallback((q: string) => {
    updateParams({ q, page: 1 });
  }, [updateParams]);

  const setDeporte = useCallback((deporte: string) => {
    updateParams({ deporte, page: 1 });
  }, [updateParams]);

  const setPriceRange = useCallback((minPrice: string, maxPrice: string) => {
    updateParams({ min_price: minPrice, max_price: maxPrice, page: 1 });
  }, [updateParams]);

  const setSort = useCallback((sort: string) => {
    const sortValue = sort === 'recientes' ? null : sort;
    updateParams({ sort: sortValue, page: 1 });
  }, [updateParams]);

  const setPage = useCallback((page: number) => {
    updateParams({ page });
  }, [updateParams]);

  const resetFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  return {
    filters,
    setSearch,
    setDeporte,
    setPriceRange,
    setSort,
    setPage,
    resetFilters,
  };
}
