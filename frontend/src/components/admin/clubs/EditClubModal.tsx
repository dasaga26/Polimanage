import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateClub } from '@/mutations/clubs/useUpdateClub';
import { useUsersQuery } from '@/queries/users/useUsersQuery';
import { showSuccess, showError } from '@/lib/alerts';
import type { Club, UpdateClubData, ClubStatus } from '@/types/clubTypes';

interface EditClubModalProps {
    isOpen: boolean;
    onClose: () => void;
    club: Club | null;
}

export function EditClubModal({ isOpen, onClose, club }: EditClubModalProps) {
    const updateMutation = useUpdateClub();
    const { data: usersData } = useUsersQuery({ limit: 1000 });
    // Filtrar solo usuarios con rol CLUB (roleId = 3)
    const clubOwners = (usersData?.data || []).filter(u => u.roleId === 3);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<ClubStatus>('ACTIVE' as ClubStatus);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors },
    } = useForm<UpdateClubData>();

    useEffect(() => {
        if (club) {
            setValue('name', club.name);
            setValue('description', club.description || '');
            setValue('logoUrl', club.logoUrl || '');
            setValue('ownerSlug', club.ownerSlug || '__none__');
            setValue('maxMembers', club.maxMembers);
            // Convertir de céntimos a euros para mostrar en el input
            setValue('monthlyFeeCents', club.monthlyFeeCents / 100);
            setValue('isActive', club.isActive);
            setStatus(club.status as ClubStatus);
        }
    }, [club, setValue]);

    const onSubmit = async (data: UpdateClubData) => {
        if (!club) return;

        setIsSubmitting(true);
        try {
            // Filtrar valor especial de ownerSlug y convertir euros → céntimos
            const updateData = { 
                ...data, 
                status,
                monthlyFeeCents: Math.round((data.monthlyFeeCents || 0) * 100),
                ownerSlug: data.ownerSlug === '__none__' ? undefined : data.ownerSlug,
            };
            await updateMutation.mutateAsync({ slug: club.slug, data: updateData });
            showSuccess('Club actualizado', `El club "${data.name}" ha sido actualizado correctamente`);
            onClose();
        } catch (error: any) {
            showError('Error al actualizar', error?.response?.data?.error || 'No se pudo actualizar el club');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!club) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Editar Club</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Label htmlFor="name">Nombre del Club *</Label>
                            <Input
                                id="name"
                                {...register('name', { required: 'El nombre es obligatorio' })}
                                placeholder="Ej: Club de Tenis"
                            />
                            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="Descripción del club..."
                                rows={3}
                            />
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="logoUrl">URL del Logo</Label>
                            <Input id="logoUrl" {...register('logoUrl')} placeholder="https://ejemplo.com/logo.png" />
                        </div>

                        {clubOwners.length > 0 && (
                            <div className="col-span-2">
                                <Label htmlFor="ownerSlug">Propietario del Club (Rol CLUB)</Label>
                                <Controller
                                    name="ownerSlug"
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value || '__none__'} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar propietario (opcional)..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__none__">Sin propietario</SelectItem>
                                                {clubOwners.map((owner) => (
                                                    <SelectItem key={owner.slug} value={owner.slug}>
                                                        {owner.fullName} ({owner.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Usuario que gestionará este club. Solo usuarios con rol CLUB pueden ser propietarios.
                                </p>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="maxMembers">Capacidad Máxima *</Label>
                            <Input
                                id="maxMembers"
                                type="number"
                                {...register('maxMembers', {
                                    required: 'La capacidad es obligatoria',
                                    min: { value: 1, message: 'Mínimo 1 miembro' },
                                })}
                                min="1"
                            />
                            {errors.maxMembers && <p className="text-sm text-red-600 mt-1">{errors.maxMembers.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="monthlyFeeCents">Cuota Mensual (€)</Label>
                            <Input
                                id="monthlyFeeCents"
                                type="number"
                                step="0.01"
                                {...register('monthlyFeeCents', {
                                    valueAsNumber: true,
                                    min: { value: 0, message: 'No puede ser negativo' },
                                })}
                                min="0"
                            />
                            {errors.monthlyFeeCents && (
                                <p className="text-sm text-red-600 mt-1">{errors.monthlyFeeCents.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="status">Estado del Club</Label>
                            <Select value={status} onValueChange={(value) => setStatus(value as ClubStatus)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Activo</SelectItem>
                                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                                    <SelectItem value="FULL">Completo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2 col-span-2">
                            <input
                                id="isActive"
                                type="checkbox"
                                {...register('isActive')}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <Label htmlFor="isActive" className="cursor-pointer">
                                Club activo
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Actualizando...' : 'Actualizar Club'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
