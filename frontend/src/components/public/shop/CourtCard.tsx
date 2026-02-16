import type { Pista } from '@/services/pistaService';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar } from 'lucide-react';

// El backend envía precioHoraBase ya en euros (no en céntimos)
const formatPrice = (price: number): string => {
  return price.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });
};

interface CourtCardProps {
  pista: Pista;
}

// Mapeo de tipos a colores (las claves deben coincidir exactamente con los valores de la BD)
const TIPO_COLORS: Record<string, string> = {
  'Pádel': 'bg-blue-100 text-blue-800 border-blue-200',
  'Tenis': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Fútbol Sala': 'bg-green-100 text-green-800 border-green-200',
  'Baloncesto': 'bg-orange-100 text-orange-800 border-orange-200',
  'Voleibol': 'bg-purple-100 text-purple-800 border-purple-200',
  'Squash': 'bg-red-100 text-red-800 border-red-200',
};

export function CourtCard({ pista }: CourtCardProps) {
  const tipoColor = TIPO_COLORS[pista.tipo] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <div className="group bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
      {/* Imagen */}
      <div className="relative h-56 overflow-hidden bg-gray-50">
        {pista.imageUrl ? (
          <>
            <img
              src={pista.imageUrl}
              alt={pista.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-7xl mb-3 opacity-40">🏟️</div>
              <p className="text-sm font-medium text-gray-400">{pista.tipo}</p>
            </div>
          </div>
        )}
        <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-md text-xs font-semibold ${tipoColor} shadow-sm backdrop-blur-sm`}>
          {pista.tipo}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        <div className="mb-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {pista.nombre}
          </h3>
          {pista.superficie && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="h-3.5 w-3.5" />
              <span>{pista.superficie}</span>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">Desde</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(pista.precioHoraBase)}
              <span className="text-sm font-normal text-gray-500">/h</span>
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
            <Calendar className="h-4 w-4 mr-2" />
            Reservar
          </Button>
        </div>
      </div>
    </div>
  );
}
