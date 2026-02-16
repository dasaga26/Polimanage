import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export function SubscriptionsHeader() {
    const queryClient = useQueryClient();

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Subscripciones de Clubs
                </h1>
                <p className="mt-1 text-gray-600">
                    Gestiona las membresías y pagos recurrentes
                </p>
            </div>
            <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['subscriptions'] })}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
            </button>
        </div>
    );
}
