import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { X, Filter } from 'lucide-react';
import { PriceRangeSlider } from './PriceRangeSlider';

interface FiltersSidebarProps {
  deporte: string;
  minPrice: string;
  maxPrice: string;
  maxPriceLimit?: number;
  onDeporteChange: (deporte: string) => void;
  onPriceRangeChange: (min: string, max: string) => void;
  onReset: () => void;
}

const DEPORTES = [
  { value: '', label: 'Todos los deportes' },
  { value: 'Pádel', label: 'Pádel' },
  { value: 'Tenis', label: 'Tenis' },
  { value: 'Fútbol Sala', label: 'Fútbol Sala' },
  { value: 'Baloncesto', label: 'Baloncesto' },
  { value: 'Voleibol', label: 'Voleibol' },
  { value: 'Squash', label: 'Squash' },
];

// Estos valores coinciden EXACTAMENTE con los de la base de datos

export function FiltersSidebar({
  deporte,
  minPrice,
  maxPrice,
  maxPriceLimit,
  onDeporteChange,
  onPriceRangeChange,
  onReset,
}: FiltersSidebarProps) {
  const hasActiveFilters = deporte || minPrice || maxPrice;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-lg text-gray-900">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      <Separator className="bg-gray-200" />

      {/* Tipo de Deporte */}
      <div className="space-y-3">
        <Label className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Deporte
        </Label>
        <RadioGroup value={deporte} onValueChange={onDeporteChange}>
          {DEPORTES.map((dep) => (
            <Label
              key={dep.value}
              htmlFor={`deporte-${dep.value}`}
              className="flex items-center space-x-3 py-2.5 px-3 rounded-md hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
            >
              <RadioGroupItem value={dep.value} id={`deporte-${dep.value}`} className="text-blue-600" />
              <span className="font-medium flex-1 text-gray-700">
                {dep.label}
              </span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <Separator className="bg-gray-200" />

      {/* Rango de Precio con Slider */}
      <PriceRangeSlider
        minPrice={minPrice}
        maxPrice={maxPrice}
        maxLimit={maxPriceLimit}
        onPriceRangeChange={onPriceRangeChange}
      />
    </div>
  );
}
