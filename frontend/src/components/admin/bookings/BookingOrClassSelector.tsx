import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Users } from 'lucide-react';

interface BookingOrClassSelectorProps {
    open: boolean;
    onClose: () => void;
    onSelectType: (type: 'booking' | 'class') => void;
    pistaName: string;
    dateTime: string;
}

export function BookingOrClassSelector({
    open,
    onClose,
    onSelectType,
    pistaName,
    dateTime,
}: BookingOrClassSelectorProps) {
    const handleSelect = (type: 'booking' | 'class') => {
        onSelectType(type);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>¿Qué deseas crear?</DialogTitle>
                    <p className="text-sm text-gray-600 mt-2">
                        {pistaName} - {dateTime}
                    </p>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    {/* Booking Option */}
                    <button
                        onClick={() => handleSelect('booking')}
                        className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all group"
                    >
                        <Calendar className="w-12 h-12 text-blue-600 mb-3" />
                        <span className="text-lg font-semibold text-gray-900">Reserva</span>
                        <span className="text-xs text-gray-600 mt-1">Uso individual</span>
                    </button>

                    {/* Class Option */}
                    <button
                        onClick={() => handleSelect('class')}
                        className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300 transition-all group"
                    >
                        <Users className="w-12 h-12 text-green-600 mb-3" />
                        <span className="text-lg font-semibold text-gray-900">Clase</span>
                        <span className="text-xs text-gray-600 mt-1">Actividad grupal</span>
                    </button>
                </div>

                <div className="text-xs text-gray-500 text-center pb-2">
                    Presiona <kbd className="px-1 py-0.5 bg-gray-100 border rounded">ESC</kbd> para cancelar
                </div>
            </DialogContent>
        </Dialog>
    );
}
