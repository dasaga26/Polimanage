import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Users, Calendar, MapPin, User, Clock, Euro } from 'lucide-react';
import { showConfirm } from '@/lib/alerts';
import type { Class } from '@/types/classTypes';

interface ClassDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    classItem: Class;
    onEdit: (classItem: Class) => void;
    onDelete: (classItem: Class) => void;
    onManage: (classItem: Class) => void;

}

export function ClassDetailsModal({
    isOpen,
    onClose,
    classItem,
    onManage,
    onEdit,
    onDelete,
}: ClassDetailsModalProps) {

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const enrolledCount = classItem.enrollments?.length || 0;
    const maxCapacity = classItem.maxCapacity || classItem.capacity || 0;
    // Calculate percentage for progress bar if we wanted one, or color coding
    const isFull = enrolledCount >= maxCapacity;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">{classItem.title || classItem.name}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Ocupación - Highlighted */}
                    <div className={`p-4 rounded-lg border ${isFull ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Ocupación
                            </span>
                            <span className={`text-lg font-bold ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                                {enrolledCount} / {maxCapacity}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full ${isFull ? 'bg-red-600' : 'bg-green-600'}`}
                                style={{ width: `${Math.min((enrolledCount / maxCapacity) * 100, 100)}%` }}
                            ></div>
                        </div>
                        {isFull && <p className="text-xs text-red-600 mt-2 font-medium">Clase Completa</p>}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <div>
                                <Label className="text-xs text-gray-500">Fecha</Label>
                                <p className="font-medium capitalize">{formatDate(classItem.startTime)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-gray-500" />
                            <div>
                                <Label className="text-xs text-gray-500">Horario</Label>
                                <p className="font-medium">
                                    {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-gray-500" />
                            <div>
                                <Label className="text-xs text-gray-500">Ubicación</Label>
                                <p className="font-medium">{classItem.pistaName || 'Pista desconocida'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-gray-500" />
                            <div>
                                <Label className="text-xs text-gray-500">Monitor</Label>
                                <p className="font-medium">{classItem.instructorName || 'Sin asignar'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Euro className="h-5 w-5 text-gray-500" />
                            <div>
                                <Label className="text-xs text-gray-500">Precio</Label>
                                <p className="font-medium">€{(classItem.priceCents / 100).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex sm:justify-between gap-2">
                    <Button
                        variant="destructive"
                        onClick={async () => {
                            const confirmed = await showConfirm(
                                '¿Eliminar clase?',
                                '¿Seguro que quieres eliminar esta clase?'
                            );
                            if (confirmed) {
                                onDelete(classItem);
                                onClose();
                            }
                        }}
                    >
                        Eliminar Clase
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onManage(classItem)}
                    >
                        <Users className="h-4 w-4 mr-1" />
                        Gestionar
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cerrar
                        </Button>
                        <Button
                            onClick={() => {
                                onEdit(classItem);
                                onClose();
                            }}
                        >
                            Editar
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
