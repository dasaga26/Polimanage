import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateClub } from '@/mutations/clubs/useCreateClub';
import { useUsersQuery } from '@/queries/users/useUsersQuery';
import { showSuccess, showError } from '@/lib/alerts';
import type { CreateClubData } from '@/types/clubTypes';

interface CreateClubModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateClubModal({ isOpen, onClose }: CreateClubModalProps) {
    const createMutation = useCreateClub();
    const { data: clubOwners = [] } = useUsersQuery(3); // Filtrar solo usuarios con rol CLUB
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<CreateClubData>({
        defaultValues: {
            monthlyFeeCents: 0,
            maxMembers: 50,
            isActive: true,
        },
    });

    const onSubmit = async (data: CreateClubData) => {
        setIsSubmitting(true);
        try {
            // ownerSlug es obligatorio ahora
            if (!data.ownerSlug || data.ownerSlug === '__none__') {
                showError('Error', 'Debes seleccionar un propietario para el club');
                setIsSubmitting(false);
                return;
            }
            
            await createMutation.mutateAsync(data);
            showSuccess('Club creado', `El club "${data.name}" ha sido creado correctamente`);
            reset();
            onClose();
        } catch (error: any) {
            showError('Error al crear club', error?.response?.data?.error || 'No se pudo crear el club');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Club</DialogTitle>
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

                        {clubOwners.length > 0 ? (
                            <div className="col-span-2">
                                <Label htmlFor="ownerSlug">Propietario del Club (Rol CLUB) *</Label>
                                <Controller
                                    name="ownerSlug"
                                    control={control}
                                    rules={{ required: 'Debes seleccionar un propietario' }}
                                    render={({ field }) => (
                                        <Select value={field.value || '__none__'} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar propietario..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__none__" disabled>
                                                    Seleccionar propietario...
                                                </SelectItem>
                                                {clubOwners.map((owner) => (
                                                    <SelectItem key={owner.slug} value={owner.slug}>
                                                        {owner.fullName} ({owner.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ownerSlug && <p className="text-sm text-red-600 mt-1">{errors.ownerSlug.message}</p>}
                                <p className="text-xs text-gray-500 mt-1">
                                    Usuario que gestionará este club. Primero debes crear un usuario con rol CLUB.
                                </p>
                            </div>
                        ) : (
                            <div className="col-span-2 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>No hay usuarios con rol CLUB disponibles.</strong>
                                    <br />
                                    Para crear un club, primero debes crear un usuario con rol "CLUB" desde la sección de Usuarios.
                                </p>
                            </div>
                        )}

                        <div className="col-span-2">
                            <Label htmlFor="logoUrl">URL del Logo</Label>
                            <Input id="logoUrl" {...register('logoUrl')} placeholder="https://ejemplo.com/logo.png" />
                        </div>

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
                                    setValueAs: (v: string) => Math.round(parseFloat(v) * 100),
                                    min: { value: 0, message: 'No puede ser negativo' },
                                })}
                                min="0"
                                placeholder="0.00"
                            />
                            <p className="text-xs text-gray-500 mt-1">Deja en 0 si es gratuito</p>
                            {errors.monthlyFeeCents && (
                                <p className="text-sm text-red-600 mt-1">{errors.monthlyFeeCents.message}</p>
                            )}
                        </div>

                        <div className="col-span-2">
                            <div className="flex items-center gap-2">
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
                            <p className="text-xs text-gray-500 mt-1">
                                Los clubs inactivos no aparecerán para nuevas inscripciones
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting || clubOwners.length === 0}>
                            {isSubmitting ? 'Creando...' : 'Crear Club'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
