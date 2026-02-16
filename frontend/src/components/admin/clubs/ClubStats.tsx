import { Activity, Users, DollarSign } from 'lucide-react';
import type { Club } from '@/types/clubTypes';

interface ClubStatsProps {
  clubs: Club[];
}

export function ClubStats({ clubs }: ClubStatsProps) {
  const activeClubs = clubs.filter((c) => c.status === 'ACTIVE' && c.isActive).length;
  const totalMembers = clubs.reduce((sum, club) => sum + club.memberCount, 0);
  const monthlyRevenue = clubs.reduce((sum, club) => sum + club.memberCount * club.monthlyFeeEuros, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Clubs</p>
            <p className="text-2xl font-bold text-gray-900">{clubs.length}</p>
          </div>
          <Activity className="h-10 w-10 text-blue-500" />
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Clubs Activos</p>
            <p className="text-2xl font-bold text-green-600">{activeClubs}</p>
          </div>
          <Activity className="h-10 w-10 text-green-500" />
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Miembros</p>
            <p className="text-2xl font-bold text-purple-600">{totalMembers}</p>
          </div>
          <Users className="h-10 w-10 text-purple-500" />
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Ingresos Mensuales</p>
            <p className="text-2xl font-bold text-indigo-600">{monthlyRevenue.toFixed(2)}€</p>
          </div>
          <DollarSign className="h-10 w-10 text-indigo-500" />
        </div>
      </div>
    </div>
  );
}
