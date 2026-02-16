import { useState } from 'react';
import { Loader2, CreditCard, Pause, Play, XCircle, Calendar } from 'lucide-react';
import { useRenewMembership } from '@/mutations/subscriptions/useRenewMembership';
import {
    useSuspendMembership,
    useResumeMembership,
    useCancelMembership,
    useUpdateBillingDate,
} from '@/mutations/subscriptions/useSubscriptionActions';
import { UpdateBillingDateModal } from './UpdateBillingDateModal';
import { showConfirm, showSuccess, showError } from '@/lib/alerts';
import type { ClubMembership, Club } from '@/types/clubTypes';
import { format, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface SubscriptionsTableProps {
    memberships: ClubMembership[];
    clubs: Club[];
}

export function SubscriptionsTable({ memberships, clubs }: SubscriptionsTableProps) {
    const [actioningId, setActioningId] = useState<number | null>(null);
    const [billingDateModal, setBillingDateModal] = useState<{
        isOpen: boolean;
        membership: ClubMembership | null;
    }>({ isOpen: false, membership: null });
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    const renewMutation = useRenewMembership();
    const suspendMutation = useSuspendMembership();
    const resumeMutation = useResumeMembership();
    const cancelMutation = useCancelMembership();
    const updateBillingMutation = useUpdateBillingDate();

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleRenewMembership = (membership: ClubMembership) => {
        setActioningId(membership.id);
        renewMutation.mutate(
            {
                membershipId: membership.id,
                data: { customerId: membership.userEmail },
            },
            {
                onSuccess: () => {
                    showMessage('success', 'Membresía renovada correctamente');
                    setActioningId(null);
                },
                onError: (error: unknown) => {
                    const errorMessage =
                        (error as { response?: { data?: { error?: string } } })?.response?.data
                            ?.error || 'Ocurrió un error al renovar la membresía';
                    showMessage('error', errorMessage);
                    setActioningId(null);
                },
            }
        );
    };

    const handleSuspendMembership = async (membershipId: number, userName: string) => {
        const confirmed = await showConfirm(
            '¿Pausar subscripción?',
            `Se pausará la subscripción de ${userName}. No se realizarán más cobros hasta que se reactive.`
        );
        if (!confirmed) return;

        setActioningId(membershipId);
        suspendMutation.mutate(membershipId, {
            onSuccess: () => {
                showSuccess('Subscripción pausada', 'La membresía ha sido pausada correctamente');
                setActioningId(null);
            },
            onError: (error: unknown) => {
                const errorMessage =
                    (error as { response?: { data?: { error?: string } } })?.response?.data
                        ?.error || 'Error al pausar la membresía';
                showError('Error al pausar', errorMessage);
                setActioningId(null);
            },
        });
    };

    const handleResumeMembership = async (membershipId: number, userName: string) => {
        const confirmed = await showConfirm(
            '¿Reactivar subscripción?',
            `Se reactivará la subscripción de ${userName}. Se reanudarán los cobros automáticos.`
        );
        if (!confirmed) return;

        setActioningId(membershipId);
        resumeMutation.mutate(membershipId, {
            onSuccess: () => {
                showSuccess('Subscripción reactivada', 'La membresía ha sido reactivada correctamente');
                setActioningId(null);
            },
            onError: (error: unknown) => {
                const errorMessage =
                    (error as { response?: { data?: { error?: string } } })?.response?.data
                        ?.error || 'Error al reactivar la membresía';
                showError('Error al reactivar', errorMessage);
                setActioningId(null);
            },
        });
    };

    const handleCancelMembership = async (membershipId: number, userName: string) => {
        const confirmed = await showConfirm(
            '¿Cancelar subscripción?',
            `Se cancelará permanentemente la subscripción de ${userName}. Esta acción NO se puede deshacer.`
        );
        if (!confirmed) return;

        setActioningId(membershipId);
        cancelMutation.mutate(membershipId, {
            onSuccess: () => {
                showSuccess('Subscripción cancelada', 'La membresía ha sido cancelada permanentemente');
                setActioningId(null);
            },
            onError: (error: unknown) => {
                const errorMessage =
                    (error as { response?: { data?: { error?: string } } })?.response?.data
                        ?.error || 'Error al cancelar la membresía';
                showError('Error al cancelar', errorMessage);
                setActioningId(null);
            },
        });
    };

    const handleUpdateBillingDate = (membership: ClubMembership) => {
        setBillingDateModal({ isOpen: true, membership });
    };

    const confirmUpdateBillingDate = (date: string) => {
        if (!billingDateModal.membership) return;

        setActioningId(billingDateModal.membership.id);
        updateBillingMutation.mutate(
            { membershipId: billingDateModal.membership.id, date },
            {
                onSuccess: () => {
                    showSuccess('Fecha actualizada', 'La fecha de cobro ha sido actualizada correctamente');
                    setBillingDateModal({ isOpen: false, membership: null });
                    setActioningId(null);
                },
                onError: (error: unknown) => {
                    const errorMessage =
                        (error as { response?: { data?: { error?: string } } })?.response?.data
                            ?.error || 'Error al actualizar la fecha';
                    showError('Error al actualizar', errorMessage);
                    setActioningId(null);
                },
            }
        );
    };

    const getExpirationDate = (membership: ClubMembership) => {
        if (membership.endDate) {
            return new Date(membership.endDate);
        }
        if (membership.nextBillingDate) {
            return addMonths(new Date(membership.nextBillingDate), 1);
        }
        return addMonths(new Date(membership.startDate), 1);
    };

    const getStatusBadge = (status: string, type: 'membership' | 'payment') => {
        if (type === 'membership') {
            return (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : status === 'SUSPENDED'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {status === 'ACTIVE' && 'Activa'}
                    {status === 'SUSPENDED' && 'Suspendida'}
                    {status === 'EXPIRED' && 'Expirada'}
                    {status === 'CANCELLED' && 'Cancelada'}
                </span>
            );
        } else {
            return (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'UP_TO_DATE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                >
                    {status === 'UP_TO_DATE' && 'Al Día'}
                    {status === 'PAST_DUE' && 'Atrasado'}
                </span>
            );
        }
    };

    const getClubFee = (clubId: number) => {
        const club = clubs.find((c) => c.id === clubId);
        return club?.monthlyFeeEuros || 0;
    };

    // Mostrar TODAS las membresías, no solo las activas
    const allSubscriptions = memberships;

    return (
        <>
            {message && (
                <div
                    className={`p-4 rounded-md flex items-center gap-2 ${message.type === 'success'
                            ? 'bg-green-50 text-green-800'
                            : 'bg-red-50 text-red-800'
                        }`}
                >
                    <span>{message.text}</span>
                </div>
            )}

            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Gestión de Subscripciones</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        {allSubscriptions.length} membresías totales ({allSubscriptions.filter(m => m.isActive).length} activas)
                    </p>
                </div>
                <div className="overflow-x-auto">
                    {allSubscriptions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No hay subscripciones registradas
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Club
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cuota
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pago
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Próximo Cobro
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Expira
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {allSubscriptions.map((membership) => {
                                    const expirationDate = getExpirationDate(membership);
                                    const isExpired = membership.status === 'EXPIRED';
                                    const isCancelled = membership.status === 'CANCELLED';
                                    const canSuspend = membership.status === 'ACTIVE';
                                    const canResume = membership.status === 'SUSPENDED';
                                    const canRenew = membership.isActive && !isCancelled;
                                    
                                    return (
                                        <tr key={membership.id} className={`hover:bg-gray-50 ${!membership.isActive ? 'bg-gray-50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {membership.userName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {membership.userEmail}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {membership.clubName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            €{getClubFee(membership.clubId).toFixed(2)}/mes
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(membership.status, 'membership')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(membership.paymentStatus, 'payment')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {membership.nextBillingDate
                                                ? format(new Date(membership.nextBillingDate), 'dd/MM/yyyy', {
                                                    locale: es,
                                                })
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {format(expirationDate, 'dd/MM/yyyy', { locale: es })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {canRenew && (
                                                    <button
                                                        onClick={() => handleRenewMembership(membership)}
                                                        disabled={actioningId === membership.id}
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Renovar ahora"
                                                    >
                                                        <CreditCard className="h-3 w-3 mr-1" />
                                                        {actioningId === membership.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Renovar'}
                                                    </button>
                                                )}
                                                
                                                {canSuspend && (
                                                    <button
                                                        onClick={() => handleSuspendMembership(membership.id, membership.userName)}
                                                        disabled={actioningId === membership.id}
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200 disabled:opacity-50"
                                                        title="Pausar subscripción"
                                                    >
                                                        <Pause className="h-3 w-3" />
                                                    </button>
                                                )}
                                                
                                                {canResume && (
                                                    <button
                                                        onClick={() => handleResumeMembership(membership.id, membership.userName)}
                                                        disabled={actioningId === membership.id}
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 disabled:opacity-50"
                                                        title="Reactivar subscripción"
                                                    >
                                                        <Play className="h-3 w-3" />
                                                    </button>
                                                )}
                                                
                                                {membership.isActive && (
                                                    <button
                                                        onClick={() => handleUpdateBillingDate(membership)}
                                                        disabled={actioningId === membership.id}
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded hover:bg-indigo-200 disabled:opacity-50"
                                                        title="Cambiar fecha de cobro"
                                                    >
                                                        <Calendar className="h-3 w-3" />
                                                    </button>
                                                )}
                                                
                                                {!isCancelled && !isExpired && (
                                                    <button
                                                        onClick={() => handleCancelMembership(membership.id, membership.userName)}
                                                        disabled={actioningId === membership.id}
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 disabled:opacity-50"
                                                        title="Cancelar subscripción"
                                                    >
                                                        <XCircle className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {billingDateModal.membership && (
                <UpdateBillingDateModal
                    membership={billingDateModal.membership}
                    isOpen={billingDateModal.isOpen}
                    onClose={() => setBillingDateModal({ isOpen: false, membership: null })}
                    onConfirm={confirmUpdateBillingDate}
                    isLoading={actioningId === billingDateModal.membership.id}
                />
            )}
        </>
    );
}
