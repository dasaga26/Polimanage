import { useState } from 'react';
import { X } from 'lucide-react';
import type { ClubMembership } from '@/types/clubTypes';

interface UpdateBillingDateModalProps {
  membership: ClubMembership;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  isLoading?: boolean;
}

export function UpdateBillingDateModal({
  membership,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: UpdateBillingDateModalProps) {
  const [selectedDate, setSelectedDate] = useState(
    membership.nextBillingDate
      ? new Date(membership.nextBillingDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(new Date(selectedDate).toISOString());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Actualizar Fecha de Cobro
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Membresía de <strong>{membership.userName}</strong> en{' '}
                  <strong>{membership.clubName}</strong>
                </p>
              </div>

              <div>
                <label htmlFor="billingDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Fecha de Cobro
                </label>
                <input
                  type="date"
                  id="billingDate"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> El próximo cobro se realizará automáticamente en la fecha seleccionada.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Actualizando...' : 'Actualizar Fecha'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
