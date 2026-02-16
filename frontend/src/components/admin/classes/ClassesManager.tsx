import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusFilter } from '@/components/ui/StatusFilter';
import { showSuccess, showServerError, showConfirm } from '@/lib/alerts';
import { useCreateClass } from '@/mutations/classes/useCreateClass';
import { useUpdateClass } from '@/mutations/classes/useUpdateClass';
import { useDeleteClass } from '@/mutations/classes/useDeleteClass';
import { ClassListTable } from './ClassListTable';
import { CreateClassModal } from './CreateClassModal';
import { EnrollmentManagerModal } from './EnrollmentManagerModal';
import type { Class, CreateClassDTO } from '@/types/classTypes';

interface ClassesManagerProps {
  classes: Class[];
  isLoading: boolean;
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function ClassesManager({ classes, isLoading, searchTerm, statusFilter, onSearchChange, onStatusChange }: ClassesManagerProps) {
  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();
  const deleteMutation = useDeleteClass();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classToEdit, setClassToEdit] = useState<Class | undefined>(undefined);

  const handleCreateOrUpdate = async (data: CreateClassDTO) => {
    const startTimeISO = new Date(data.startTime).toISOString();
    const endTimeISO = new Date(data.endTime).toISOString();

    const payload: CreateClassDTO = {
      ...data,
      startTime: startTimeISO,
      endTime: endTimeISO,
    };

    if (classToEdit) {
      // Modo Edición
      updateMutation.mutate(
        { slug: classToEdit.slug, data: payload },
        {
          onSuccess: () => {
            setIsCreateOpen(false);
            setClassToEdit(undefined);
            showSuccess('Clase actualizada', 'La clase se ha actualizado exitosamente');
          },
          onError: (error: any) => {
            showServerError(error, 'Error al actualizar clase');
          },
        }
      );
    } else {
      // Modo Creación
      createMutation.mutate(payload, {
        onSuccess: () => {
          setIsCreateOpen(false);
          showSuccess('Clase creada', 'La clase se ha creado exitosamente');
        },
        onError: (error: any) => {
          showServerError(error, 'Error al crear clase');
        },
      });
    }
  };

  const handleDelete = async (slug: string) => {
    const confirmed = await showConfirm(
      '¿Eliminar clase?',
      'Esta acción no se puede deshacer'
    );
    
    if (!confirmed) return;

    deleteMutation.mutate(slug, {
      onSuccess: () => {
        showSuccess('Clase eliminada', 'La clase se ha eliminado exitosamente');
      },
      onError: (error: any) => {
        showServerError(error, 'Error al eliminar clase');
      },
    });
  };

  const handleManage = (classItem: Class) => {
    setSelectedClass(classItem);
  };

  const handleEdit = (classItem: Class) => {
    setClassToEdit(classItem);
    setIsCreateOpen(true);
  };

  const handleCloseEnrollmentModal = () => {
    setSelectedClass(null);
  };

  // Opciones de filtro por estado
  const statusOptions = [
    { value: 'OPEN', label: 'Abierta' },
    { value: 'FULL', label: 'Completa' },
    { value: 'CANCELLED', label: 'Cancelada' },
    { value: 'COMPLETED', label: 'Finalizada' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clases</h1>
          <p className="text-gray-600 mt-1">
            Administra las clases, monitores e inscripciones
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nueva Clase
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-end">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Buscar por título, monitor o pista..."
          className="flex-1"
        />
        <StatusFilter
          value={statusFilter}
          onChange={onStatusChange}
          options={statusOptions}
          placeholder="Todos los estados"
          className="w-64"
        />
      </div>

      {/* Tabla de Clases */}
      <ClassListTable
        classes={classes}
        isLoading={isLoading}
        onManage={handleManage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Creación/Edición */}
      <CreateClassModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setClassToEdit(undefined);
        }}
        onSubmit={handleCreateOrUpdate}
        classToEdit={classToEdit}
      />

      {/* Modal de Gestión de Inscripciones */}
      {selectedClass && (
        <EnrollmentManagerModal
          isOpen={!!selectedClass}
          onClose={handleCloseEnrollmentModal}
          selectedClass={selectedClass}
        />
      )}
    </div>
  );
}
