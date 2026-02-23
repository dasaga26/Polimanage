import { SearchInput } from '@/components/ui/SearchInput';
import { StatusFilter } from '@/components/ui/StatusFilter';

interface ClubFiltersProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function ClubFilters({ searchTerm, statusFilter, onSearchChange, onStatusChange }: ClubFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SearchInput value={searchTerm} onChange={onSearchChange} placeholder="Buscar clubs..." />
        <StatusFilter
          value={statusFilter}
          onChange={onStatusChange}
          options={[
            { value: 'all', label: 'Todos los estados' },
            { value: 'active', label: 'Activos' },
            { value: 'inactive', label: 'Inactivos' },
          ]}
        />
      </div>
    </div>
  );
}
