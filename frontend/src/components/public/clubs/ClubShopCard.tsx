import type { Club } from '@/types/clubTypes';
import { Users } from 'lucide-react';

const formatFee = (cents: number) =>
    (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

const STATUS_STYLES: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800 border-green-200',
    INACTIVE: 'bg-gray-100 text-gray-700 border-gray-200',
    FULL: 'bg-red-100 text-red-800 border-red-200',
};
const STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    FULL: 'Completo',
};

interface ClubShopCardProps {
    club: Club;
}

export function ClubShopCard({ club }: ClubShopCardProps) {
    const statusStyle = STATUS_STYLES[club.status] ?? STATUS_STYLES.ACTIVE;
    const occupancy = Math.min(Math.round((club.memberCount / club.maxMembers) * 100), 100);
    const isFull = club.status === 'FULL' || club.memberCount >= club.maxMembers;

    return (
        <div className="group bg-white rounded-xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col">
            {/* Imagen / Logo */}
            <div className="relative h-52 overflow-hidden bg-gray-100">
                {club.logoUrl ? (
                    <>
                        <img
                            src={club.logoUrl}
                            alt={club.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-7xl mb-2 opacity-30">🏆</div>
                            <p className="text-sm font-medium text-gray-400">{club.name}</p>
                        </div>
                    </div>
                )}
                {/* Badge estado */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-md text-xs font-semibold border ${statusStyle} shadow-sm backdrop-blur-sm`}>
                    {STATUS_LABELS[club.status] ?? club.status}
                </div>
                {/* Badge completo */}
                {isFull && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-md text-xs font-bold bg-red-500 text-white shadow-sm">
                        COMPLETO
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {club.name}
                </h3>
                {club.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{club.description}</p>
                )}
                {!club.description && <div className="flex-1" />}

                {/* Barra de ocupación */}
                <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            Socios
                        </span>
                        <span className="font-medium text-gray-700">
                            {club.memberCount} / {club.maxMembers}
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${occupancy >= 90 ? 'bg-red-500' : occupancy >= 60 ? 'bg-amber-500' : 'bg-green-500'
                                }`}
                            style={{ width: `${occupancy}%` }}
                        />
                    </div>
                </div>

                {/* Precio y acción */}
                <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Cuota mensual</p>
                        {club.monthlyFeeCents > 0 ? (
                            <p className="text-2xl font-bold text-gray-900">
                                {formatFee(club.monthlyFeeCents)}
                                <span className="text-sm font-normal text-gray-500">/mes</span>
                            </p>
                        ) : (
                            <p className="text-lg font-bold text-green-600">Gratuito</p>
                        )}
                    </div>
                    <button
                        disabled={isFull}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm ${isFull
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                    >
                        {isFull ? 'Sin plazas' : 'Unirse'}
                    </button>
                </div>
            </div>
        </div>
    );
}
