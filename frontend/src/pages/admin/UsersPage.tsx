import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useUsersQuery } from '@/queries';
import { UsersManager } from '@/components/admin/users/UsersManager';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Debounce para la búsqueda
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Query con paginación del servidor
  const { data, isLoading } = useUsersQuery({
    page,
    limit: 10,
    search: debouncedSearch,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sort: 'recientes',
  });

  // Extraer datos de la respuesta paginada
  const users = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;
  const totalUsers = data?.meta?.totalItems || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <UsersManager 
      users={users}
      totalUsers={totalUsers}
      currentPage={page}
      totalPages={totalPages}
      searchTerm={searchTerm}
      statusFilter={statusFilter}
      onSearchChange={setSearchTerm}
      onStatusChange={setStatusFilter}
      onPageChange={setPage}
    />
  );
}
