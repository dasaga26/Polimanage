import { StatsCard } from '../StatsCard';
import { Users, Calendar, CreditCard, Package } from 'lucide-react';
import { useDashboardStatsQuery } from '@/queries';

export function DashboardStats() {
  const { data: stats, isLoading } = useDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Panel de control administrativo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Usuarios"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="blue"
          trend={{
            value: stats?.monthlyGrowth.users || 0,
            isPositive: (stats?.monthlyGrowth.users || 0) > 0,
          }}
        />
        <StatsCard
          title="Reservas Totales"
          value={stats?.totalBookings || 0}
          icon={Calendar}
          color="green"
          trend={{
            value: stats?.monthlyGrowth.bookings || 0,
            isPositive: (stats?.monthlyGrowth.bookings || 0) > 0,
          }}
        />
        <StatsCard
          title="Ingresos"
          value={`€${((stats?.totalRevenue || 0) / 100).toFixed(2)}`}
          icon={CreditCard}
          color="purple"
          trend={{
            value: stats?.monthlyGrowth.revenue || 0,
            isPositive: (stats?.monthlyGrowth.revenue || 0) > 0,
          }}
        />
        <StatsCard
          title="Suscripciones Activas"
          value={stats?.activeSubscriptions || 0}
          icon={Package}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Actividad Reciente</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nueva reserva confirmada</p>
                <p className="text-xs text-gray-500">Hace 5 minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nuevo usuario registrado</p>
                <p className="text-xs text-gray-500">Hace 15 minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Pago procesado</p>
                <p className="text-xs text-gray-500">Hace 30 minutos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Enlaces Rápidos</h2>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/admin/users"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
            >
              <Users className="mb-2 text-blue-600" size={24} />
              <p className="font-medium">Usuarios</p>
              <p className="text-xs text-gray-500">Gestionar usuarios</p>
            </a>
            <a
              href="/admin/pistas"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
            >
              <Calendar className="mb-2 text-green-600" size={24} />
              <p className="font-medium">Pistas</p>
              <p className="text-xs text-gray-500">Gestionar pistas</p>
            </a>
            <a
              href="/admin/bookings"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
            >
              <Calendar className="mb-2 text-purple-600" size={24} />
              <p className="font-medium">Reservas</p>
              <p className="text-xs text-gray-500">Ver reservas</p>
            </a>
            <a
              href="/admin/payments"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
            >
              <CreditCard className="mb-2 text-orange-600" size={24} />
              <p className="font-medium">Pagos</p>
              <p className="text-xs text-gray-500">Ver pagos</p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
