import type { Class } from '@/types/classTypes';
import { ClassCard } from './ClassCard';

interface ClassGridProps {
  classes: Class[];
  isLoading?: boolean;
}

export function ClassGrid({ classes, isLoading }: ClassGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg overflow-hidden shadow border border-gray-200">
            <div className="bg-gradient-to-br from-blue-200 to-blue-300 h-32" />
            <div className="p-5 space-y-3">
              <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="pt-4 border-t border-gray-100">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-20 px-6">
        <div className="text-8xl mb-6 opacity-40">📚</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          No se encontraron clases
        </h3>
        <p className="text-gray-600 text-lg mb-6">
          Intenta ajustar tus filtros de búsqueda
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-5 py-3 rounded-lg">
          <span>💡</span>
          <span>Prueba cambiando el instructor o el rango de precios</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {classes.map((classItem) => (
        <ClassCard key={classItem.id} classItem={classItem} />
      ))}
    </div>
  );
}
