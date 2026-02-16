import { useState } from 'react';
import { MoreVertical, Pause, Play, XCircle, Calendar, CreditCard } from 'lucide-react';
import type { ClubMembership } from '@/types/clubTypes';

interface MembershipActionsMenuProps {
  membership: ClubMembership;
  onSuspend: () => void;
  onResume: () => void;
  onCancel: () => void;
  onRenew: () => void;
  onUpdateBillingDate: () => void;
  isLoading?: boolean;
}

export function MembershipActionsMenu({
  membership,
  onSuspend,
  onResume,
  onCancel,
  onRenew,
  onUpdateBillingDate,
  isLoading = false,
}: MembershipActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const canSuspend = membership.status === 'ACTIVE';
  const canResume = membership.status === 'SUSPENDED';
  const canCancel = membership.status !== 'CANCELLED' && membership.status !== 'EXPIRED';
  const canRenew = membership.isActive;

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 disabled:opacity-50"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              {canRenew && (
                <button
                  onClick={() => handleAction(onRenew)}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <CreditCard className="mr-3 h-4 w-4 text-green-600" />
                  Renovar Ahora
                </button>
              )}

              {canSuspend && (
                <button
                  onClick={() => handleAction(onSuspend)}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Pause className="mr-3 h-4 w-4 text-yellow-600" />
                  Pausar Subscripción
                </button>
              )}

              {canResume && (
                <button
                  onClick={() => handleAction(onResume)}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Play className="mr-3 h-4 w-4 text-blue-600" />
                  Reanudar Subscripción
                </button>
              )}

              {membership.isActive && (
                <button
                  onClick={() => handleAction(onUpdateBillingDate)}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Calendar className="mr-3 h-4 w-4 text-blue-600" />
                  Cambiar Fecha de Cobro
                </button>
              )}

              {canCancel && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => handleAction(onCancel)}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="mr-3 h-4 w-4" />
                    Cancelar Subscripción
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
