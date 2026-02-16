import type { Class } from '@/types/classTypes';
import { Button } from '@/components/ui/button';
import { Clock, Users, Calendar } from 'lucide-react';

const formatPrice = (priceCents: number): string => {
  return (priceCents / 100).toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });
};

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

interface ClassCardProps {
  classItem: Class;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Abierta', color: 'bg-green-100 text-green-800 border-green-200' },
  FULL: { label: 'Completa', color: 'bg-red-100 text-red-800 border-red-200' },
  CANCELLED: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  COMPLETED: { label: 'Finalizada', color: 'bg-blue-100 text-blue-800 border-blue-200' },
};

export function ClassCard({ classItem }: ClassCardProps) {
  const status = classItem.status || 'OPEN';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
  const enrolledCount = classItem.enrollments?.length || 0;
  const maxCapacity = classItem.maxCapacity || classItem.capacity || 0;
  const isFull = status === 'FULL' || enrolledCount >= maxCapacity;
  const isDisabled = isFull || status === 'CANCELLED' || status === 'COMPLETED';
  const capacityPercentage = Math.min((enrolledCount / maxCapacity) * 100, 100);

  return (
    <div className="group bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 relative">
      {/* Ribbon diagonal para clase completa */}
      {isFull && (
        <div className="absolute top-6 -right-10 bg-red-500 text-white px-12 py-1.5 transform rotate-45 shadow-lg z-10 text-xs font-bold tracking-wider">
          COMPLETA
        </div>
      )}

      {/* Overlay sutil cuando está llena */}
      {isFull && (
        <div className="absolute inset-0 bg-red-50/40 backdrop-blur-[1px] z-[1] pointer-events-none" />
      )}

      {/* Header con fecha */}
      <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white z-[2]">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs opacity-90 mb-1">📅 {formatDate(classItem.startTime)}</p>
            <h3 className="font-bold text-xl line-clamp-1">
              {classItem.title || classItem.name}
            </h3>
          </div>
          <div className={`px-3 py-1 rounded-md text-xs font-semibold ${
            isFull ? STATUS_CONFIG.FULL.color : statusConfig.color
          } backdrop-blur-sm`}>
            {isFull ? STATUS_CONFIG.FULL.label : statusConfig.label}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm opacity-90">
          <Clock className="h-4 w-4" />
          <span>
            {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 relative z-[2]">
        <div className="space-y-3 mb-4">
          {/* Instructor */}
          {classItem.instructorName && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                {classItem.instructorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-gray-500">Instructor</p>
                <p className="font-medium">{classItem.instructorName}</p>
              </div>
            </div>
          )}

          {/* Pista */}
          {classItem.pistaName && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-lg">🏟️</span>
              <span>{classItem.pistaName}</span>
            </div>
          )}

          {/* Capacidad */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span className={isFull ? 'font-semibold text-red-600' : ''}>
              {enrolledCount} / {maxCapacity} inscritos
            </span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  isFull 
                    ? 'bg-red-500' 
                    : capacityPercentage >= 80 
                    ? 'bg-orange-500' 
                    : 'bg-blue-600'
                }`}
                style={{ width: `${capacityPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">Precio</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(classItem.priceCents)}
            </p>
          </div>
          <Button 
            className={
              isFull 
                ? 'bg-red-500 hover:bg-red-500 shadow-sm cursor-not-allowed opacity-75'
                : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
            }
            disabled={isDisabled}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {isFull ? 'Completa' : status === 'CANCELLED' ? 'Cancelada' : 'Inscribirse'}
          </Button>
        </div>
      </div>
    </div>
  );
}
