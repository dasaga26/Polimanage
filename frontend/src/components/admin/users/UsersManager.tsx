import { useState } from 'react';
import { DataTable } from '../DataTable';
import { Plus } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusFilter } from '@/components/ui/StatusFilter';
import { Pagination } from '@/components/public/shop/Pagination';
import { showSuccess, showServerError, showConfirm } from '@/lib/alerts';
import { useCreateUser, useUpdateUser, useDeleteUser } from '@/mutations';
import type { User, CreateUserDTO, UpdateUserDTO } from '@/services/userService';
import { UserModal } from '../modals/UserModal';

interface UsersManagerProps {
  users: User[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

export function UsersManager({ 
  users, 
  totalUsers,
  currentPage,
  totalPages,
  searchTerm, 
  statusFilter, 
  onSearchChange, 
  onStatusChange,
  onPageChange,
}: UsersManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    const confirmed = await showConfirm(
      '¿Eliminar usuario?',
      `¿Estás seguro de eliminar a "${user.fullName}"?`
    );
    
    if (!confirmed) return;

    deleteMutation.mutate(user.slug, {
      onSuccess: () => {
        showSuccess('Usuario eliminado', 'El usuario se ha eliminado exitosamente');
      },
      onError: (error: any) => {
        showServerError(error, 'Error al eliminar usuario');
      },
    });
  };

  const handleSubmit = (data: CreateUserDTO | UpdateUserDTO) => {
    if (selectedUser) {
      updateMutation.mutate(
        { slug: selectedUser.slug, data: data as UpdateUserDTO },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setSelectedUser(null);
            showSuccess('Usuario actualizado', 'El usuario se ha actualizado exitosamente');
          },
          onError: (error: any) => {
            showServerError(error, 'Error al actualizar usuario');
          },
        }
      );
    } else {
      createMutation.mutate(data as CreateUserDTO, {
        onSuccess: () => {
          setIsModalOpen(false);
          showSuccess('Usuario creado', 'El usuario se ha creado exitosamente');
        },
        onError: (error: any) => {
          showServerError(error, 'Error al crear usuario');
        },
      });
    }
  };

  // Opciones de filtro por estado
  const statusOptions = [
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'fullName', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    {
      key: 'roleName',
      label: 'Rol',
      render: (user: User) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
          {user.roleName || 'N/A'}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (user: User) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            user.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {user.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    { key: 'phone', label: 'Teléfono' },
  ];

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600 mt-1">
            {totalUsers} {totalUsers === 1 ? 'usuario' : 'usuarios'} en total
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedUser(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-4 items-end">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Buscar por nombre, email, rol o teléfono..."
          className="flex-1"
        />
        <StatusFilter
          value={statusFilter}
          onChange={onStatusChange}
          options={statusOptions}
          placeholder="Todos los usuarios"
          className="w-64"
        />
      </div>

      <DataTable
        data={users}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={false}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}

      {isModalOpen && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
