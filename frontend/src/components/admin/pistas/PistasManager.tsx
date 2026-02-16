import { useState } from 'react';
import { DataTable } from '../DataTable';
import { Plus } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusFilter } from '@/components/ui/StatusFilter';
import { showSuccess, showServerError, showConfirm } from '@/lib/alerts';
import { useCreatePista, useUpdatePista, useDeletePista } from '@/mutations';
import type { Pista, CreatePistaDTO, UpdatePistaDTO } from '@/services/pistaService';
import { PistaModal } from '../modals/PistaModal';

interface PistasManagerProps {
  pistas: Pista[];
  searchTerm: string;
  estadoFilter: string;
  onSearchChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
}

export function PistasManager({ pistas, searchTerm, estadoFilter, onSearchChange, onEstadoChange }: PistasManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPista, setSelectedPista] = useState<Pista | null>(null);
  const createMutation = useCreatePista();
  const updateMutation = useUpdatePista();
  const deleteMutation = useDeletePista();

  const handleEdit = (pista: Pista) => {
    setSelectedPista(pista);
    setIsModalOpen(true);
  };

  const handleDelete = async (pista: Pista) => {
    const confirmed = await showConfirm(
      '¿Eliminar pista?',
      `¿Estás seguro de eliminar la pista "${pista.nombre}"?`
    );

    if (!confirmed) return;

    deleteMutation.mutate(pista.id, {
      onSuccess: () => {
        showSuccess('Pista eliminada', 'La pista se ha eliminado exitosamente');
      },
      onError: (error: Error) => {
        showServerError(error, 'Error al eliminar pista');
      },
    });
  };

  const handleSubmit = (data: CreatePistaDTO | UpdatePistaDTO) => {
    if (selectedPista) {
      updateMutation.mutate(
        { id: selectedPista.id, data: data as UpdatePistaDTO },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setSelectedPista(null);
            showSuccess('Pista actualizada', 'La pista se ha actualizado exitosamente');
          },
          onError: (error: Error) => {
            showServerError(error, 'Error al actualizar pista');
          },
        }
      );
    } else {
      createMutation.mutate(data as CreatePistaDTO, {
        onSuccess: () => {
          setIsModalOpen(false);
          showSuccess('Pista creada', 'La pista se ha creado exitosamente');
        },
        onError: (error: Error) => {
          showServerError(error, 'Error al crear pista');
        },
      });
    }
  };

  // Opciones de filtro por estado
  const estadoOptions = [
    { value: 'DISPONIBLE', label: 'Disponible' },
    { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
    { value: 'INACTIVA', label: 'Inactiva' },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'superficie', label: 'Superficie' },
    {
      key: 'precioHoraBase',
      label: 'Precio Base',
      render: (pista: Pista) => `€${pista.precioHoraBase.toFixed(2)}`,
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (pista: Pista) => {
        const colors: Record<string, string> = {
          DISPONIBLE: 'bg-green-100 text-green-800',
          MANTENIMIENTO: 'bg-yellow-100 text-yellow-800',
          INACTIVA: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs ${colors[pista.estado] || 'bg-gray-100 text-gray-800'}`}>
            {pista.estado}
          </span>
        );
      },
    },
    {
      key: 'esActiva',
      label: 'Activa',
      render: (pista: Pista) => (
        <span
          className={`px-2 py-1 rounded text-xs ${pista.esActiva ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
        >
          {pista.esActiva ? 'Sí' : 'No'}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pistas</h1>
          <p className="text-gray-600 mt-1">Gestión de pistas disponibles</p>
        </div>
        <button
          onClick={() => {
            setSelectedPista(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nueva Pista
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-4 items-end">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Buscar por nombre, tipo o superficie..."
          className="flex-1"
        />
        <StatusFilter
          value={estadoFilter}
          onChange={onEstadoChange}
          options={estadoOptions}
          placeholder="Todos los estados"
          className="w-64"
        />
      </div>

      <DataTable
        data={pistas}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={false}
      />

      {isModalOpen && (
        <PistaModal
          pista={selectedPista}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPista(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
