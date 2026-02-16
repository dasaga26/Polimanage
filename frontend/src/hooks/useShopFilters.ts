import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

export interface ShopFilters {
  q: string;
  deporte: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  page: number;
}

export function useShopFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Leer valores directamente de la URL en cada render (sin useMemo para evitar loops)
  const filters: ShopFilters = {
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
    }, { replace: true }); // replace: true evita agregar entradas al historial
  }, [setSearchParams]);

  // Setters individuales
  const setSearch = useCallback((q: string) => {
    updateParams({ q, page: 1 }); // Reset página al buscar
  }, [updateParams]);

  const setDeporte = useCallback((deporte: string) => {
    updateParams({ deporte, page: 1 });
  }, [updateParams]);

  const setMinPrice = useCallback((minPrice: string) => {
    updateParams({ min_price: minPrice, page: 1 });
  }, [updateParams]);

  const setMaxPrice = useCallback((maxPrice: string) => {
    updateParams({ max_price: maxPrice, page: 1 });
  }, [updateParams]);

  const setPriceRange = useCallback((minPrice: string, maxPrice: string) => {
    updateParams({ min_price: minPrice, max_price: maxPrice, page: 1 });
  }, [updateParams]);

  const setSort = useCallback((sort: string) => {
    // No guardar 'recientes' en la URL ya que es el valor por defecto
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
    setMinPrice,
    setMaxPrice,
    setPriceRange,
    setSort,
    setPage,
    resetFilters,
  };
}
