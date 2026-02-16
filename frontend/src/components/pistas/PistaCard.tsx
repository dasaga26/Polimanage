import type { Pista } from '../../services/pistaService';

interface PistaCardProps {
    pista: Pista;
}

export const PistaCard = ({ pista }: PistaCardProps) => {
    return (
        <div className="border rounded-lg shadow-sm p-6 bg-card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{pista.nombre}</h3>
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${pista.esActiva
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {pista.esActiva ? 'Activa' : 'Inactiva'}
                </span>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="font-medium">{pista.tipo}</span>
                </div>

                {pista.superficie && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Superficie:</span>
                        <span className="font-medium">{pista.superficie}</span>
                    </div>
                )}

                <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio/hora:</span>
                    <span className="font-medium">{pista.precioHoraBase.toFixed(2)} €</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <span className="font-medium capitalize">{pista.estado}</span>
                </div>
            </div>
        </div>
    );
};
