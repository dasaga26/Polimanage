import { usePistas } from '../../queries/usePistas';
import { PistaCard } from './PistaCard';

export const PistasList = () => {
    const { data, isLoading, isError, error } = usePistas();
    const pistas = data?.data || [];

    if (isLoading) {
        return (
            <div className="w-full min-h-[400px] border rounded-lg shadow-sm flex items-center justify-center bg-card">
                <p className="text-lg text-muted-foreground">Cargando pistas...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="w-full min-h-[400px] border rounded-lg shadow-sm flex items-center justify-center bg-card">
                <p className="text-lg text-red-500">
                    Error al cargar las pistas: {error?.message}
                </p>
            </div>
        );
    }

    if (!pistas || pistas.length === 0) {
        return (
            <div className="w-full min-h-[400px] border rounded-lg shadow-sm flex items-center justify-center bg-card">
                <p className="text-lg text-muted-foreground">
                    Aún no hay pistas disponibles
                </p>
            </div>
        );
    }

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pistas.map((pista) => (
                <PistaCard key={pista.id} pista={pista} />
            ))}
        </div>
    );
};
