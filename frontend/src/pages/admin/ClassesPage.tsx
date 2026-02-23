import { useState, useMemo } from 'react';
import { useClassesQuery } from '@/queries/classes/useClassesQuery';
import { ClassesManager } from '@/components/admin/classes/ClassesManager';

export default function ClassesPage() {
  const { data, isLoading } = useClassesQuery({ limit: 1000 });
  const classes = data?.data || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredClasses = useMemo(() => {
    let result = classes;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(search) ||
          c.instructorName?.toLowerCase().includes(search) ||
          c.pistaName?.toLowerCase().includes(search)
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    return result;
  }, [classes, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando clases...</p>
        </div>
      </div>
    );
  }

  return (
    <ClassesManager 
      classes={filteredClasses}
      searchTerm={searchTerm}
      statusFilter={statusFilter}
      onSearchChange={setSearchTerm}
      onStatusChange={setStatusFilter}
      isLoading={false}
    />
  );
}


