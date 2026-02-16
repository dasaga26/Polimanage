import { useState, useMemo } from 'react';
import { useUsersQuery } from '@/queries';
import { UsersManager } from '@/components/admin/users/UsersManager';

export default function UsersPage() {
  const { data: users = [], isLoading } = useUsersQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUsers = useMemo(() => {
    let result = users;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search) ||
          u.roleName?.toLowerCase().includes(search) ||
          u.phone?.toLowerCase().includes(search)
      );
    }

    if (statusFilter === 'active') {
      result = result.filter((u) => u.isActive);
    } else if (statusFilter === 'inactive') {
      result = result.filter((u) => !u.isActive);
    }

    return result;
  }, [users, searchTerm, statusFilter]);

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
      users={filteredUsers}
      searchTerm={searchTerm}
      statusFilter={statusFilter}
      onSearchChange={setSearchTerm}
      onStatusChange={setStatusFilter}
    />
  );
}
