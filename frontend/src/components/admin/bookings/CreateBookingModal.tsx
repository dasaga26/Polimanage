import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePistasQuery } from '@/queries/pistas/usePistasQuery';
import { useUsersQuery } from '@/queries/users/useUsersQuery';
import type { Booking, CreateBookingData } from '@/services/bookingService';

interface CreateBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateBookingData) => void;
    prefill?: {
        pistaId?: number;
        date?: string;
        hour?: number;
    };
    bookingToEdit?: Booking;
}

export function CreateBookingModal({
    isOpen,
    onClose,
    onSubmit,
    prefill,
    bookingToEdit
}: CreateBookingModalProps) {
    const { data: pistas = [] } = usePistasQuery();
    const { data: users = [] } = useUsersQuery();
    const isEditing = !!bookingToEdit;

    // State
    const [userId, setUserId] = useState<string>('');
    const [pistaId, setPistaId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [startHour, setStartHour] = useState<string>('09');
    const [notes, setNotes] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            if (bookingToEdit) {
                // Edit Mode
                const startDate = new Date(bookingToEdit.startTime);
                setUserId(bookingToEdit.userId.toString());
                setPistaId(bookingToEdit.pistaId.toString());
                setSelectedDate(startDate.toISOString().split('T')[0]);
                setStartHour(startDate.getHours().toString());
                setNotes(bookingToEdit.notes || '');
            } else {
                // Create Mode
                setUserId('');
                setPistaId(prefill?.pistaId?.toString() || (pistas.length > 0 ? pistas[0].id.toString() : ''));
                setSelectedDate(prefill?.date || new Date().toISOString().split('T')[0]);
                setStartHour(prefill?.hour?.toString() || '09');
                setNotes('');
            }
        }
    }, [isOpen, bookingToEdit, prefill, pistas]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!pistaId || !selectedDate || !startHour) return;

        // Calculate End Time (always 1 hour for now)
        const startDateTime = new Date(`${selectedDate}T${startHour.padStart(2, '0')}:00:00`);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

        const data: CreateBookingData = {
            userId: userId || undefined, // UUID string or undefined
            pistaId: parseInt(pistaId),
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            notes: notes || undefined
        };

        onSubmit(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Reserva' : 'Nueva Reserva'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Usuario */}
                    <div className="space-y-2">
                        <Label htmlFor="user">Usuario</Label>
                        <Select value={userId} onValueChange={setUserId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar usuario..." />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                        {user.fullName} ({user.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {!userId && <p className="text-xs text-yellow-600">⚠ Si no seleccionas usuario, se asignará al sistema.</p>}
                    </div>

                    {/* Pista */}
                    <div className="space-y-2">
                        <Label htmlFor="pista">Pista</Label>
                        <Select value={pistaId} onValueChange={setPistaId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar pista" />
                            </SelectTrigger>
                            <SelectContent>
                                {pistas.map((pista) => (
                                    <SelectItem key={pista.id} value={pista.id.toString()}>
                                        {pista.nombre} ({pista.tipo})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Fecha y Hora */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Fecha</Label>
                            <Input
                                id="date"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Hora Inicio</Label>
                            <Select value={startHour} onValueChange={setStartHour}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 14 }, (_, i) => i + 9).map((h) => (
                                        <SelectItem key={h} value={h.toString()}>
                                            {h}:00
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas (Opcional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Detalles adicionales..."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">{isEditing ? 'Guardar Cambios' : 'Crear Reserva'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
