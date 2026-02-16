import { useState, useMemo } from 'react';
import { usePistasQuery } from '@/queries';
import { PistasManager } from '@/components/admin/pistas/PistasManager';

export default function PistasPage() {
  const { data: pistas = [], isLoading } = usePistasQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('all');

  const filteredPistas = useMemo(() => {
    let result = pistas;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(search) ||
          p.tipo?.toLowerCase().includes(search) ||
          p.superficie?.toLowerCase().includes(search)
      );
    }

    if (estadoFilter && estadoFilter !== 'all') {
      result = result.filter((p) => p.estado === estadoFilter);
    }

    return result;
  }, [pistas, searchTerm, estadoFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pistas...</p>
        </div>
      </div>
    );
  }

  return (
    <PistasManager 
      pistas={filteredPistas}
      searchTerm={searchTerm}
      estadoFilter={estadoFilter}
      onSearchChange={setSearchTerm}
      onEstadoChange={setEstadoFilter}
    />
  );
}
