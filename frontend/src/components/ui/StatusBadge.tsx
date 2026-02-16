import { Badge } from './badge';

interface StatusBadgeProps {
    status: string;
    className?: string;
}

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; className?: string }> = {
    // Estados de clases
    OPEN: { variant: 'default', label: 'Abierta', className: 'bg-green-100 text-green-800 border-green-200' },
    FULL: { variant: 'secondary', label: 'Completa', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    CANCELLED: { variant: 'destructive', label: 'Cancelada', className: 'bg-red-100 text-red-800 border-red-200' },
    COMPLETED: { variant: 'outline', label: 'Finalizada', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    
    // Estados de reservas
    PENDING: { variant: 'secondary', label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    CONFIRMED: { variant: 'default', label: 'Confirmada', className: 'bg-green-100 text-green-800 border-green-200' },
    
    // Estados generales
    ACTIVE: { variant: 'default', label: 'Activa', className: 'bg-green-100 text-green-800 border-green-200' },
    INACTIVE: { variant: 'destructive', label: 'Inactiva', className: 'bg-red-100 text-red-800 border-red-200' },
    
    // Estados de pago
    PAID: { variant: 'default', label: 'Pagado', className: 'bg-green-100 text-green-800 border-green-200' },
    UNPAID: { variant: 'destructive', label: 'No Pagado', className: 'bg-red-100 text-red-800 border-red-200' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status] || { 
        variant: 'outline' as const, 
        label: status,
        className: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
        <Badge 
            variant={config.variant} 
            className={`${config.className} ${className || ''}`}
        >
            {config.label}
        </Badge>
    );
}

// Badge con progreso visual
export function CapacityBadge({ 
    current, 
    max 
}: { 
    current: number; 
    max: number;
}) {
    const percentage = (current / max) * 100;
    const isFull = percentage >= 100;
    const isAlmostFull = percentage >= 80;

    return (
        <div className="flex items-center gap-2">
            <Badge 
                variant={isFull ? 'destructive' : isAlmostFull ? 'secondary' : 'default'}
                className={
                    isFull 
                        ? 'bg-red-100 text-red-800 border-red-200' 
                        : isAlmostFull 
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : 'bg-green-100 text-green-800 border-green-200'
                }
            >
                {current} / {max}
            </Badge>
        </div>
    );
}
