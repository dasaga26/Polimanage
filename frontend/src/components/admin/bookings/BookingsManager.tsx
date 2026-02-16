import { DataTable } from '../DataTable';
import { useBookingsQuery } from '@/queries';
import { useDeleteBooking } from '@/mutations';
import { showConfirm, showSuccess, showServerError } from '@/lib/alerts';
import type { Booking } from '@/types/admin';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function BookingsManager() {
  const { data: bookings = [], isLoading } = useBookingsQuery();
  const deleteMutation = useDeleteBooking();

  const handleDelete = async (booking: Booking) => {
    const confirmed = await showConfirm(
      '¿Eliminar reserva?',
      '¿Estás seguro de eliminar esta reserva?'
    );
    
    if (!confirmed) return;

    deleteMutation.mutate(booking.id, {
      onSuccess: () => {
        showSuccess('Reserva eliminada', 'La reserva se ha eliminado exitosamente');
      },
      onError: (error: any) => {
        showServerError(error, 'Error al eliminar reserva');
      },
    });
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'user',
      label: 'Usuario',
      render: (booking: Booking) => booking.userName || booking.user?.fullName || `ID: ${booking.userId}`,
    },
    {
      key: 'pista',
      label: 'Pista',
      render: (booking: Booking) => booking.pistaName || booking.pista?.name || `ID: ${booking.pistaId}`,
    },
    {
      key: 'startTime',
      label: 'Fecha/Hora',
      render: (booking: Booking) => {
        try {
          return format(new Date(booking.startTime), "dd MMM yyyy 'a las' HH:mm", { locale: es });
        } catch {
          return booking.startTime;
        }
      },
    },
    {
      key: 'priceSnapshotCents',
      label: 'Precio',
      render: (booking: Booking) => `€${(booking.priceSnapshotCents / 100).toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Estado',
      render: (booking: Booking) => {
        const colors = {
          PENDING: 'bg-yellow-100 text-yellow-800',
          CONFIRMED: 'bg-green-100 text-green-800',
          CANCELLED: 'bg-red-100 text-red-800',
          COMPLETED: 'bg-blue-100 text-blue-800',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs ${colors[booking.status]}`}>
            {booking.status}
          </span>
        );
      },
    },
    {
      key: 'paymentStatus',
      label: 'Pago',
      render: (booking: Booking) => {
        const colors = {
          UNPAID: 'bg-red-100 text-red-800',
          PAID: 'bg-green-100 text-green-800',
          REFUNDED: 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs ${colors[booking.paymentStatus]}`}>
            {booking.paymentStatus}
          </span>
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
        <p className="text-gray-600 mt-1">Gestión de reservas de pistas</p>
      </div>

      <DataTable
        data={bookings}
        columns={columns}
        onDelete={handleDelete}
        loading={isLoading}
      />
    </>
  );
}

