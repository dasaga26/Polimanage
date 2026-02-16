import { Loader2, AlertCircle } from 'lucide-react';
import { useSubscriptionsQuery } from '@/queries/subscriptions/useSubscriptionsQuery';
import { useClubsQuery } from '@/queries/clubs/useClubsQuery';
import { SubscriptionsHeader } from '@/components/admin/subscriptions/SubscriptionsHeader';
import { SubscriptionsStats } from '@/components/admin/subscriptions/SubscriptionsStats';
import { SubscriptionsTable } from '@/components/admin/subscriptions/SubscriptionsTable';

export default function SubscriptionsPage() {
    const { data: memberships = [], isLoading: loadingMemberships, error } = useSubscriptionsQuery();
    const { data: clubs = [], isLoading: loadingClubs } = useClubsQuery();

    const isLoading = loadingMemberships || loadingClubs;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <AlertCircle className="h-12 w-12 text-red-600" />
                <p className="text-lg text-gray-600">Error al cargar las subscripciones</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SubscriptionsHeader />
            <SubscriptionsStats memberships={memberships} />
            <SubscriptionsTable memberships={memberships} clubs={clubs} />
        </div>
    );
}
