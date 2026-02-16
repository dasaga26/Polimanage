import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { showConfirm } from '@/lib/alerts';
import { User, Calendar, MapPin, Clock, Euro, FileText } from 'lucide-react';
import type { Booking } from '@/services/bookingService';

interface BookingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking;
    onEdit: (booking: Booking) => void;
    onCancel: (booking: Booking) => void;
}

export function BookingDetailsModal({
    isOpen,
    onClose,
    booking,
    onEdit,
    onCancel,
}: BookingDetailsModalProps) {

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-800';
            case 'UNPAID': return 'bg-yellow-100 text-yellow-800';
            case 'REFUNDED': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Detalles de Reserva</span>
                        <Badge className={getStatusColor(booking.status)} variant="outline">
                            {booking.status === 'CONFIRMED' ? 'Confirmada' :
                                booking.status === 'CANCELLED' ? 'Cancelada' :
                                    booking.status === 'PENDING' ? 'Pendiente' : booking.status}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">

                    {/* User Info Highlighted */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <Label className="text-xs text-gray-500">Reservado por</Label>
                            <p className="font-semibold text-lg">{booking.userName}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <div>
                                <Label className="text-xs text-gray-500">Fecha</Label>
                                <p className="font-medium capitalize">{formatDate(booking.startTime)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-gray-500" />
                            <div>
                                <Label className="text-xs text-gray-500">Horario</Label>
                                <p className="font-medium">
                                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-gray-500" />
                            <div>
                                <Label className="text-xs text-gray-500">Pista</Label>
                                <p className="font-medium">{booking.pistaName} ({booking.pistaType})</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Euro className="h-5 w-5 text-gray-500" />
                            <div>
                                <Label className="text-xs text-gray-500">Precio & Pago</Label>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">€{booking.priceSnapshotEuros.toFixed(2)}</p>
                                    <Badge className={`${getPaymentStatusColor(booking.paymentStatus)} text-xs px-2 py-0`} variant="secondary">
                                        {booking.paymentStatus === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {booking.notes && (
                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-gray-500 mt-1" />
                                <div>
                                    <Label className="text-xs text-gray-500">Notas</Label>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border mt-1">
                                        {booking.notes}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex sm:justify-between gap-2">
                    {booking.status !== 'CANCELLED' && (
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                const confirmed = await showConfirm(
                                    '¿Cancelar reserva?',
                                    '¿Seguro que quieres cancelar esta reserva?'
                                );
                                if (confirmed) {
                                    onCancel(booking);
                                    onClose();
                                }
                            }}
                        >
                            Cancelar Reserva
                        </Button>
                    )}

                    <div className="flex gap-2 ml-auto">
                        <Button variant="outline" onClick={onClose}>
                            Cerrar
                        </Button>
                        {booking.status !== 'CANCELLED' && (
                            <Button
                                onClick={() => {
                                    onEdit(booking);
                                    onClose();
                                }}
                            >
                                Editar
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
