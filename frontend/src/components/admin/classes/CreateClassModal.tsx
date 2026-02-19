import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { showWarning } from '@/lib/alerts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePistasQuery } from '@/queries/pistas/usePistasQuery';
import { useUsersQuery } from '@/queries/users/useUsersQuery';
import type { CreateClassDTO, Class } from '@/types/classTypes';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClassDTO) => void;
  // Optional prefill data from calendar
  prefill?: {
    pistaId?: number;
    date?: string; // YYYY-MM-DD
    hour?: number; // 9-22
  };
  classToEdit?: Class;
}

export function CreateClassModal({
  isOpen,
  onClose,
  onSubmit,
  prefill,
  classToEdit,
}: CreateClassModalProps) {
  const { data: pistas = [] } = usePistasQuery();
  const { data: allUsers = [] } = useUsersQuery();

  // Filtrar usuarios: Solo ADMIN (1), GESTOR (2) y MONITOR (4) pueden ser monitores
  const instructors = allUsers.filter((u) => [4].includes(u.roleId));

  const isEditing = !!classToEdit;

  const [formData, setFormData] = useState<CreateClassDTO>({
    title: '',
    instructorId: '',
    pistaId: prefill?.pistaId || 0,
    maxCapacity: 10,
    priceCents: 0,
    startTime: '',
    endTime: '',
    status: 'OPEN',
    isActive: true,
  });

  // State para los selectores de fecha/hora mejorados
  const [selectedDate, setSelectedDate] = useState<string>(prefill?.date || ''); // YYYY-MM-DD
  const [startHour, setStartHour] = useState<string>(prefill?.hour?.toString() || '09'); // 09-22
  const [durationMinutes, setDurationMinutes] = useState<string>('60'); // 30, 60, 90, 120, 180

  // Validaciones en tiempo real
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (formData.title.length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres';
    }

    if (!formData.instructorId || formData.instructorId === '') {
      newErrors.instructorId = 'Debes seleccionar un monitor';
    }

    if (formData.pistaId === 0) {
      newErrors.pistaId = 'Debes seleccionar una pista';
    }

    if (formData.maxCapacity < 1) {
      newErrors.maxCapacity = 'La capacidad debe ser al menos 1';
    } else if (formData.maxCapacity > 50) {
      newErrors.maxCapacity = 'La capacidad máxima es 50 personas';
    }

    if (formData.priceCents < 0) {
      newErrors.priceCents = 'El precio no puede ser negativo';
    }

    if (!selectedDate) {
      newErrors.date = 'La fecha es requerida';
    } else {
      const selected = new Date(selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.date = 'No puedes programar clases en el pasado';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form cuando el modal se abre
  // Reset/Fill form cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      if (classToEdit) {
        // Modo Edición
        const startDate = new Date(classToEdit.startTime);
        const endDate = new Date(classToEdit.endTime);
        const duration = (endDate.getTime() - startDate.getTime()) / 60000;

        setFormData({
          title: classToEdit.title || classToEdit.name,
          instructorId: classToEdit.instructorId,
          pistaId: classToEdit.pistaId,
          maxCapacity: classToEdit.maxCapacity || 10,
          priceCents: classToEdit.priceCents,
          startTime: classToEdit.startTime,
          endTime: classToEdit.endTime,
          status: classToEdit.status || 'OPEN',
          isActive: classToEdit.isActive !== undefined ? classToEdit.isActive : true,
        });

        setSelectedDate(startDate.toISOString().split('T')[0]);
        setStartHour(startDate.getHours().toString());
        setDurationMinutes(duration.toString());

      } else {
        // Modo Creación (Reset)
        setFormData({
          title: '',
          instructorId: '',
          pistaId: prefill?.pistaId || 0,
          maxCapacity: 10,
          priceCents: 0,
          startTime: '',
          endTime: '',
          status: 'OPEN',
          isActive: true,
        });
        setSelectedDate(prefill?.date || '');
        setStartHour(prefill?.hour?.toString() || '09');
        setDurationMinutes('60');
      }
    }
  }, [isOpen, classToEdit, prefill]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showWarning('Formulario incompleto', 'Por favor, corrige los errores marcados en rojo');
      return;
    }

    const duration = parseInt(durationMinutes);
    const startDateTime = new Date(`${selectedDate}T${startHour.padStart(2, '0')}:00:00`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    const updatedFormData = {
      ...formData,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    };

    onSubmit(updatedFormData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Clase' : 'Programar Nueva Clase'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Título */}
            <div>
              <Label htmlFor="title">Título de la Clase *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) {
                    setErrors({ ...errors, title: '' });
                  }
                }}
                placeholder="Ej: Clase de Pádel Avanzado"
                required
                className={errors.title ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Pista */}
            <div>
              <Label htmlFor="pista">Pista *</Label>
              <Select
                value={formData.pistaId.toString()}
                onValueChange={(value: string) => {
                  setFormData({ ...formData, pistaId: Number(value) });
                  if (errors.pistaId) {
                    setErrors({ ...errors, pistaId: '' });
                  }
                }}
              >
                <SelectTrigger className={errors.pistaId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecciona una pista" />
                </SelectTrigger>
                <SelectContent>
                  {pistas.map((pista) => (
                    <SelectItem key={pista.id} value={pista.id.toString()}>
                      {pista.nombre} ({pista.tipo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pistaId && (
                <p className="text-sm text-red-600 mt-1">{errors.pistaId}</p>
              )}
            </div>

            {/* Monitor */}
            <div>
              <Label htmlFor="instructor">Monitor *</Label>
              <Select
                value={formData.instructorId === '' ? undefined : formData.instructorId}
                onValueChange={(value: string) => {
                  setFormData({ ...formData, instructorId: value });
                  if (errors.instructorId) {
                    setErrors({ ...errors, instructorId: '' });
                  }
                }}
              >
                <SelectTrigger className={errors.instructorId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecciona un monitor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.fullName} ({user.roleName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.instructorId && (
                <p className="text-sm text-red-600 mt-1">{errors.instructorId}</p>
              )}
            </div>

            {/* Capacidad y Precio */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacidad Máxima</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.maxCapacity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData({
                      ...formData,
                      maxCapacity: Number(e.target.value),
                    });
                    if (errors.maxCapacity) {
                      setErrors({ ...errors, maxCapacity: '' });
                    }
                  }}
                  className={errors.maxCapacity ? 'border-red-500' : ''}
                />
                {errors.maxCapacity && (
                  <p className="text-sm text-red-600 mt-1">{errors.maxCapacity}</p>
                )}
              </div>
              <div>
                <Label htmlFor="price">Precio (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.priceCents / 100}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      priceCents: Math.round(Number(e.target.value) * 100),
                    })
                  }
                  placeholder="15.00"
                />
              </div>
            </div>

            {/* Horario */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (errors.date) {
                      setErrors({ ...errors, date: '' });
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && (
                  <p className="text-sm text-red-600 mt-1">{errors.date}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startHour">Hora inicio *</Label>
                  <Select value={startHour} onValueChange={setStartHour}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 14 }, (_, i) => i + 9).map(hour => (
                        <SelectItem key={hour} value={hour.toString()}>
                          {hour.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duración *</Label>
                  <Select value={durationMinutes} onValueChange={setDurationMinutes}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                      <SelectItem value="180">3 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedDate && startHour && durationMinutes && (
                <p className="text-sm text-muted-foreground">
                  Horario: {selectedDate} {startHour}:00 -
                  {new Date(new Date(`${selectedDate}T${startHour.padStart(2, '0')}:00:00`).getTime() + parseInt(durationMinutes) * 60000)
                    .toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            {/* Estado y Activa */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Estado *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: 'OPEN' | 'FULL' | 'CANCELLED' | 'COMPLETED') => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Abierta</SelectItem>
                    <SelectItem value="FULL">Completa</SelectItem>
                    <SelectItem value="CANCELLED">Cancelada</SelectItem>
                    <SelectItem value="COMPLETED">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Clase Activa
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">{isEditing ? 'Guardar Cambios' : 'Crear Clase'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
