// @ts-nocheck
import { DataTable } from '../DataTable';
import { usePaymentsQuery } from '@/queries';
import type { Payment } from '@/types/admin';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function PaymentsManager() {
  const { data: payments = [], isLoading } = usePaymentsQuery();

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'user',
      label: 'Usuario',
      render: (payment: Payment) => payment.user?.fullName || `ID: ${payment.userId}`,
    },
    {
      key: 'amountCents',
      label: 'Monto',
      render: (payment: Payment) => `€${(payment.amountCents / 100).toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Estado',
      render: (payment: Payment) => {
        const colors = {
          SUCCEEDED: 'bg-green-100 text-green-800',
          PENDING: 'bg-yellow-100 text-yellow-800',
          FAILED: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs ${colors[payment.status]}`}>
            {payment.status}
          </span>
        );
      },
    },
    {
      key: 'concept',
      label: 'Concepto',
      render: (payment: Payment) => {
        if (payment.bookingId) return 'Reserva';
        if (payment.classEnrollmentId) return 'Clase';
        if (payment.tournamentId) return 'Torneo';
        if (payment.subscriptionId) return 'Suscripción';
        return '-';
      },
    },
    { key: 'provider', label: 'Proveedor' },
    {
      key: 'createdAt',
      label: 'Fecha',
      render: (payment: Payment) => {
        try {
          return format(new Date(payment.createdAt!), 'dd MMM yyyy HH:mm', { locale: es });
        } catch {
          return payment.createdAt || '-';
        }
      },
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
        <p className="text-gray-600 mt-1">Historial de pagos del sistema</p>
      </div>

      <DataTable data={payments} columns={columns} loading={isLoading} />
    </>
  );
}
