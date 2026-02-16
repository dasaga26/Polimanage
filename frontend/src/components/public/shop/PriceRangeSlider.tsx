import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';

interface PriceRangeSliderProps {
    minPrice: string;
    maxPrice: string;
    maxLimit?: number;
    onPriceRangeChange: (min: string, max: string) => void;
}

const MIN = 0;
const DEFAULT_MAX = 100;
const DEBOUNCE_DELAY = 500;

export function PriceRangeSlider({
    minPrice,
    maxPrice,
    maxLimit,
    onPriceRangeChange,
}: PriceRangeSliderProps) {
    const MAX = maxLimit && maxLimit > 0 ? Math.ceil(maxLimit) : DEFAULT_MAX;
    const debounceTimeout = useRef<number | null>(null);
    const isUserInteracting = useRef(false);
    
    // Inicializar con valores válidos
    const initialMin = minPrice && parseInt(minPrice) >= MIN ? parseInt(minPrice) : MIN;
    const initialMax = maxPrice && parseInt(maxPrice) <= MAX ? parseInt(maxPrice) : MAX;
    
    const [localMin, setLocalMin] = useState(initialMin);
    const [localMax, setLocalMax] = useState(initialMax);

    // Actualizar valores locales cuando cambien los props externos (ej: reset)
    useEffect(() => {
        if (!isUserInteracting.current) {
            const newMin = minPrice && parseInt(minPrice) >= MIN ? parseInt(minPrice) : MIN;
            const newMax = maxPrice && parseInt(maxPrice) <= MAX ? parseInt(maxPrice) : MAX;
            setLocalMin(newMin);
            setLocalMax(newMax);
        }
    }, [minPrice, maxPrice, MIN, MAX]);

    // Ajustar localMax si MAX cambia y localMax es mayor que el nuevo MAX
    useEffect(() => {
        if (localMax > MAX) {
            setLocalMax(MAX);
        }
    }, [MAX, localMax]);

    // Debounce: Solo actualiza los filtros después de que el usuario para de mover el slider
    useEffect(() => {
        if (!isUserInteracting.current) return;

        if (debounceTimeout.current !== null) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = window.setTimeout(() => {
            onPriceRangeChange(localMin.toString(), localMax.toString());
            isUserInteracting.current = false;
        }, DEBOUNCE_DELAY);

        return () => {
            if (debounceTimeout.current !== null) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [localMin, localMax, onPriceRangeChange]);

    const handleMinChange = (value: number) => {
        isUserInteracting.current = true;
        const newMin = Math.min(value, localMax - 1);
        setLocalMin(newMin);
    };

    const handleMaxChange = (value: number) => {
        isUserInteracting.current = true;
        const newMax = Math.max(value, localMin + 1);
        setLocalMax(newMax);
    };

    const minPercent = ((localMin - MIN) / (MAX - MIN)) * 100;
    const maxPercent = ((localMax - MIN) / (MAX - MIN)) * 100;

    return (
        <div className="space-y-4">
            <Label className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Precio por Hora
            </Label>

            {/* Valores seleccionados */}
            <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-blue-600">{localMin}€</span>
                <span className="text-gray-400">—</span>
                <span className="font-semibold text-blue-600">{localMax}€</span>
            </div>

            {/* Doble slider */}
            <div className="relative pt-1 pb-6 px-0.5">
                {/* Track de fondo */}
                <div className="absolute top-3 left-0 right-0 h-1.5 bg-gray-200 rounded-full" />

                {/* Track activo (rango seleccionado) */}
                <div
                    className="absolute top-3 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-150"
                    style={{
                        left: `${minPercent}%`,
                        right: `${100 - maxPercent}%`,
                    }}
                />

                {/* Slider mínimo */}
                <input
                    type="range"
                    min={MIN}
                    max={MAX}
                    value={localMin}
                    onChange={(e) => handleMinChange(parseInt(e.target.value))}
                    className="absolute top-0 left-0 w-full h-6 appearance-none bg-transparent pointer-events-none cursor-pointer z-10
            [&::-webkit-slider-thumb]:pointer-events-auto 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-5 
            [&::-webkit-slider-thumb]:h-5 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:bg-white 
            [&::-webkit-slider-thumb]:border-2 
            [&::-webkit-slider-thumb]:border-blue-600 
            [&::-webkit-slider-thumb]:cursor-pointer 
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:hover:scale-110 
            [&::-webkit-slider-thumb]:active:scale-95
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:duration-150
            [&::-moz-range-thumb]:pointer-events-auto 
            [&::-moz-range-thumb]:appearance-none 
            [&::-moz-range-thumb]:w-5 
            [&::-moz-range-thumb]:h-5 
            [&::-moz-range-thumb]:rounded-full 
            [&::-moz-range-thumb]:bg-white 
            [&::-moz-range-thumb]:border-2 
            [&::-moz-range-thumb]:border-blue-600 
            [&::-moz-range-thumb]:cursor-pointer 
            [&::-moz-range-thumb]:shadow-lg
            [&::-moz-range-thumb]:hover:scale-110
            [&::-moz-range-thumb]:active:scale-95
            [&::-moz-range-thumb]:transition-transform
            [&::-moz-range-thumb]:duration-150"
                />

                {/* Slider máximo */}
                <input
                    type="range"
                    min={MIN}
                    max={MAX}
                    value={localMax}
                    onChange={(e) => handleMaxChange(parseInt(e.target.value))}
                    className="absolute top-0 left-0 w-full h-6 appearance-none bg-transparent pointer-events-none cursor-pointer z-20
            [&::-webkit-slider-thumb]:pointer-events-auto 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-5 
            [&::-webkit-slider-thumb]:h-5 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:bg-white 
            [&::-webkit-slider-thumb]:border-2 
            [&::-webkit-slider-thumb]:border-blue-600 
            [&::-webkit-slider-thumb]:cursor-pointer 
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:hover:scale-110 
            [&::-webkit-slider-thumb]:active:scale-95
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:duration-150
            [&::-moz-range-thumb]:pointer-events-auto 
            [&::-moz-range-thumb]:appearance-none 
            [&::-moz-range-thumb]:w-5 
            [&::-moz-range-thumb]:h-5 
            [&::-moz-range-thumb]:rounded-full 
            [&::-moz-range-thumb]:bg-white 
            [&::-moz-range-thumb]:border-2 
            [&::-moz-range-thumb]:border-blue-600 
            [&::-moz-range-thumb]:cursor-pointer 
            [&::-moz-range-thumb]:shadow-lg
            [&::-moz-range-thumb]:hover:scale-110
            [&::-moz-range-thumb]:active:scale-95
            [&::-moz-range-thumb]:transition-transform
            [&::-moz-range-thumb]:duration-150"
                />
            </div>

            {/* Inputs numéricos */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label htmlFor="min-price-input" className="text-xs text-gray-600 font-medium">
                        Desde
                    </Label>
                    <div className="relative">
                        <Input
                            id="min-price-input"
                            type="number"
                            min={MIN}
                            max={MAX}
                            value={localMin}
                            onChange={(e) => {
                                isUserInteracting.current = true;
                                const val = parseInt(e.target.value) || MIN;
                                setLocalMin(val);
                            }}
                            placeholder="0"
                            className="pl-6 font-medium text-sm h-9"
                        />
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">€</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="max-price-input" className="text-xs text-gray-600 font-medium">
                        Hasta
                    </Label>
                    <div className="relative">
                        <Input
                            id="max-price-input"
                            type="number"
                            min={MIN}
                            max={MAX}
                            value={localMax}
                            onChange={(e) => {
                                isUserInteracting.current = true;
                                const val = parseInt(e.target.value) || MAX;
                                setLocalMax(val);
                            }}
                            placeholder="100"
                            className="pl-6 font-medium text-sm h-9"
                        />
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">€</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
