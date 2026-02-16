import { useState, useRef } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { showSuccess, showServerError, showConfirm } from '@/lib/alerts';
import { usePistasQuery } from '@/queries/pistas/usePistasQuery';
import { useBookingsByPistaAndDateQuery } from '@/queries/bookings/useBookingsQuery';
import { useClassesByPistaAndDateQuery } from '@/queries/classes/useClassesQuery';
import { useCreateBooking } from '@/mutations/bookings/useCreateBooking';
import { useCancelBooking } from '@/mutations/bookings/useDeleteBooking';
import { BookingOrClassSelector } from './BookingOrClassSelector';
import { CreateClassModal } from '../classes/CreateClassModal';
import { ClassDetailsModal } from '../classes/ClassDetailsModal';
import { CreateBookingModal } from './CreateBookingModal';
import { BookingDetailsModal } from './BookingDetailsModal';
import { useCreateClass } from '@/mutations/classes/useCreateClass';
import { useUpdateClass } from '@/mutations/classes/useUpdateClass';
import { useDeleteClass } from '@/mutations/classes/useDeleteClass';
import { useUpdateBooking } from '@/mutations/bookings/useUpdateBooking';
import { EnrollmentManagerModal, type EnrollmentManagerModalProps } from '../classes/EnrollmentManagerModal';
import type { CreateClassDTO, Class } from '@/types/classTypes';
import type { Booking, CreateBookingData } from '@/services/bookingService';

export function BookingsCalendar() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { data: pistas, isLoading: pistasLoading } = usePistasQuery();
    const [enrollmentManagerProps, setEnrollmentManagerProps] = useState<EnrollmentManagerModalProps | null>(null);
    
    // Drag to scroll
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);
    // State for creation flow
    const [selectedCell, setSelectedCell] = useState<{ pistaId: number; hour: number } | null>(null);
    const [creationType, setCreationType] = useState<'booking' | 'class' | null>(null);

    // Class Editing States
    // Class Editing States
    const [selectedClassDetails, setSelectedClassDetails] = useState<Class | null>(null);
    const [classToEdit, setClassToEdit] = useState<Class | undefined>(undefined);

    // Booking Editing States
    const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);
    const [bookingToEdit, setBookingToEdit] = useState<Booking | undefined>(undefined);

    const createBooking = useCreateBooking();
    const updateBooking = useUpdateBooking();
    const createClass = useCreateClass();
    const updateClass = useUpdateClass();
    const deleteClass = useDeleteClass();
    const cancelBooking = useCancelBooking();

    const dateStr = selectedDate.toISOString().split('T')[0];
    const hours = Array.from({ length: 14 }, (_, i) => i + 9);

    const handlePrevDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    const handleToday = () => {
        setSelectedDate(new Date());
    };

    // Handle clicking an empty cell - show type selector
    const handleCellClick = (pistaId: number, hour: number) => {
        setSelectedCell({ pistaId, hour });
        // Type selector will show automatically via render logic
    };

    // Handle type selection from selector
    const handleTypeSelect = (type: 'booking' | 'class') => {
        setCreationType(type);
    };

    // Handle creating a booking after type is selected
    const handleBookingSubmit = async (data: CreateBookingData) => {
        if (bookingToEdit) {
            // Edit Mode
            updateBooking.mutate(
                { id: bookingToEdit.id, data },
                {
                    onSuccess: () => {
                        handleCloseModals();
                        showSuccess('Reserva actualizada', 'La reserva se ha actualizado exitosamente');
                    },
                    onError: (error: any) => {
                        showServerError(error, 'Error al actualizar reserva');
                    }
                }
            );
        } else {
            // Create Mode
            createBooking.mutate(data, {
                onSuccess: () => {
                    handleCloseModals();
                    showSuccess('Reserva creada', 'La reserva se ha creado exitosamente');
                },
                onError: (error: any) => {
                    showServerError(error, 'Error al crear reserva');
                }
            });
        }
    };

    // Handle creating/updating a class
    const handleClassSubmit = (data: CreateClassDTO) => {
        const startTimeISO = new Date(data.startTime).toISOString();
        const endTimeISO = new Date(data.endTime).toISOString();

        const payload = {
            ...data,
            startTime: startTimeISO,
            endTime: endTimeISO,
        };

        if (classToEdit) {
            // Edit Mode
            updateClass.mutate(
                { slug: classToEdit.slug, data: payload },
                {
                    onSuccess: () => {
                        handleCloseModals();
                        showSuccess('Clase actualizada', 'La clase se ha actualizado exitosamente');
                    },
                    onError: (error: any) => {
                        showServerError(error, 'Error al actualizar clase');
                    }
                }
            );
        } else {
            // Create Mode
            createClass.mutate(payload, {
                onSuccess: () => {
                    handleCloseModals();
                    showSuccess('Clase creada', 'La clase se ha creado exitosamente');
                },
                onError: (error: any) => {
                    showServerError(error, 'Error al crear clase');
                }
            });
        }
    };

    const handleClassClick = (classItem: Class) => {
        setSelectedClassDetails(classItem);
    };

    const handleEditClass = (classItem: Class) => {
        setClassToEdit(classItem);
        setSelectedClassDetails(null); // Close details

        // Mock selection to satisfy modal props if needed, or modify modal to not require prefill if editing
        // For now, let's try to extract info from classItem to set selectedCell so logic flows
        const startDate = new Date(classItem.startTime);
        setSelectedCell({
            pistaId: classItem.pistaId,
            hour: startDate.getHours()
        });
        setCreationType('class');
    };

    const handleDeleteClass = async (classItem: Class) => {
        const confirmed = await showConfirm(
            '¿Eliminar clase?',
            'Esta acción no se puede deshacer'
        );
        
        if (!confirmed) return;

        deleteClass.mutate(classItem.slug, {
            onSuccess: () => {
                showSuccess('Clase eliminada', 'La clase se ha eliminado exitosamente');
                setSelectedClassDetails(null);
            },
            onError: (error: any) => {
                showServerError(error, 'Error al eliminar clase');
            }
        });
    };



    // We need to update BookingCell to pass full booking, creating a handler wrapper
    const handleBookingDetailClick = (booking: Booking) => {
        setSelectedBookingDetails(booking);
    };

    const handleEditBooking = (booking: Booking) => {
        setBookingToEdit(booking);
        setSelectedBookingDetails(null);

        // Mock selection for modal logic similarity
        const startDate = new Date(booking.startTime);
        setSelectedCell({
            pistaId: booking.pistaId,
            hour: startDate.getHours()
        });
        setCreationType('booking');
    };

    const handleCancelBookingWrapper = (booking: Booking) => {
        handleCancelBooking(booking.id, booking.pistaName, new Date(booking.startTime).getHours());
        setSelectedBookingDetails(null);
    };

    const handleManageEnrollments = (classItem: Class) => {
        setEnrollmentManagerProps({
            isOpen: true,
            onClose: () => setEnrollmentManagerProps(null),
            selectedClass: classItem
        });
    };


    // Reset creation flow
    const handleCloseModals = () => {
        setSelectedCell(null);
        setCreationType(null);
        setClassToEdit(undefined);
        setSelectedClassDetails(null);
        setBookingToEdit(undefined);
        setSelectedBookingDetails(null);
    };

    // Removed manual useEffect for Swal
    // useEffect(() => { ... }, [selectedCell, creationType]);

    const handleCancelBooking = async (bookingId: number, pistaName: string, hour: number) => {
        const confirmed = await showConfirm(
            '¿Cancelar Reserva?',
            `${pistaName} - ${hour}:00`
        );

        if (confirmed) {
            cancelBooking.mutate(bookingId);
        }
    };

    // Drag to scroll handlers
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!scrollContainerRef.current) return;
        isDraggingRef.current = true;
        startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
        scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startXRef.current) * 2; // Velocidad de scroll
        
        // Solo aplicar cursor grabbing si se ha movido al menos 5px
        if (Math.abs(walk) > 5) {
            scrollContainerRef.current.style.cursor = 'grabbing';
            scrollContainerRef.current.style.userSelect = 'none';
            scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
        }
    };

    const handleMouseUpOrLeave = () => {
        if (!scrollContainerRef.current) return;
        isDraggingRef.current = false;
        scrollContainerRef.current.style.cursor = 'grab';
        scrollContainerRef.current.style.userSelect = 'auto';
    };

    if (pistasLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Calendario de Reservas</h1>
                    <p className="text-gray-600 mt-1">Gestiona las reservas de las pistas</p>
                </div>
                <button
                    onClick={handleToday}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                    <Calendar className="w-4 h-4" />
                    Hoy
                </button>
            </div>

            {/* Date Navigation */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={handlePrevDay}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {selectedDate.toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </h2>
                    </div>

                    <button
                        onClick={handleNextDay}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Booking Grid - Wrapper con overflow */}
            <div className="w-full">
                <div 
                    ref={scrollContainerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing"
                >
                    <table className="min-w-full border-collapse">
                        <thead className="sticky top-0 z-20">
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-20 sticky left-0 bg-gray-50 z-30 border-r border-gray-200">
                                Hora
                            </th>
                            {pistas?.map((pista) => (
                                <th
                                    key={pista.id}
                                    className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                                >
                                    <div className="w-[220px]">
                                        <div className="font-semibold whitespace-nowrap">{pista.nombre}</div>
                                        <div className="text-xs text-gray-500 font-normal whitespace-nowrap">{pista.tipo}</div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {hours.map((hour) => (
                            <tr key={hour} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-600 font-medium sticky left-0 bg-white z-20 border-r border-gray-200">
                                    {hour}:00
                                </td>
                                {pistas?.map((pista) => (
                                    <BookingCell
                                        key={`${pista.id}-${hour}`}
                                        pistaId={pista.id}
                                        hour={hour}
                                        date={dateStr}
                                        onCreateBooking={handleCellClick}
                                        onClassClick={handleClassClick}
                                        onBookingClick={handleBookingDetailClick}
                                    />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Type Selector Modal */}
            {selectedCell && !creationType && (
                <BookingOrClassSelector
                    open={true}
                    onClose={handleCloseModals}
                    onSelectType={handleTypeSelect}
                    pistaName={pistas?.find(p => p.id === selectedCell.pistaId)?.nombre || ''}
                    dateTime={`${selectedDate.toLocaleDateString('es-ES')} ${selectedCell.hour}:00`}
                />
            )}

            {/* Booking Creation/Edit Modal */}
            {((selectedCell && creationType === 'booking') || bookingToEdit) && (
                <CreateBookingModal
                    isOpen={true}
                    onClose={handleCloseModals}
                    onSubmit={handleBookingSubmit}
                    prefill={selectedCell ? {
                        pistaId: selectedCell.pistaId,
                        date: dateStr,
                        hour: selectedCell.hour,
                    } : undefined}
                    bookingToEdit={bookingToEdit}
                />
            )}

            {/* Class Creation/Edit Modal */}
            {((selectedCell && creationType === 'class') || classToEdit) && (
                <CreateClassModal
                    isOpen={true}
                    onClose={handleCloseModals}
                    onSubmit={handleClassSubmit}
                    prefill={selectedCell ? {
                        pistaId: selectedCell.pistaId,
                        date: dateStr,
                        hour: selectedCell.hour,
                    } : undefined}
                    classToEdit={classToEdit}
                />
            )}

            {/* Class Details Modal */}
            {selectedClassDetails && (
                <ClassDetailsModal
                    isOpen={!!selectedClassDetails}
                    onClose={() => setSelectedClassDetails(null)}
                    classItem={selectedClassDetails}
                    onEdit={handleEditClass}
                    onDelete={handleDeleteClass}
                    onManage={handleManageEnrollments}
                />
            )}

            {/* Booking Details Modal */}
            {selectedBookingDetails && (
                <BookingDetailsModal
                    isOpen={!!selectedBookingDetails}
                    onClose={() => setSelectedBookingDetails(null)}
                    booking={selectedBookingDetails}
                    onEdit={handleEditBooking}
                    onCancel={handleCancelBookingWrapper}
                />
            )}

            {/* Enrollment Manager Modal */}
            {enrollmentManagerProps && (
                <EnrollmentManagerModal
                    isOpen={enrollmentManagerProps.isOpen}
                    onClose={enrollmentManagerProps.onClose}
                    selectedClass={enrollmentManagerProps.selectedClass}
                />
            )}
        </div>
    );
}

function BookingCell({
    pistaId,
    hour,
    date,
    onCreateBooking,
    onClassClick,
    onBookingClick
}: {
    pistaId: number;
    hour: number;
    date: string;
    onCreateBooking: (pistaId: number, hour: number) => void;
    onClassClick: (classItem: Class) => void;
    onBookingClick: (booking: Booking) => void;
}) {
    const { data: bookings, isLoading: bookingsLoading } = useBookingsByPistaAndDateQuery(pistaId, date);
    const { data: classes, isLoading: classesLoading } = useClassesByPistaAndDateQuery(pistaId, date);

    // Check if this hour is within a booking's time range
    const booking = bookings?.find(b => {
        const startHour = new Date(b.startTime).getHours();
        const endHour = new Date(b.endTime).getHours();
        return hour >= startHour && hour < endHour && b.status !== 'CANCELLED';
    });

    // Check if this hour is within a class's time range
    const classItem = classes?.find(c => {
        const startHour = new Date(c.startTime).getHours();
        const endHour = new Date(c.endTime).getHours();
        return hour >= startHour && hour < endHour && c.status !== 'CANCELLED';
    });

    // Check if this is the start hour (for showing full details)
    const isBookingStart = booking && new Date(booking.startTime).getHours() === hour;
    const isClassStart = classItem && new Date(classItem.startTime).getHours() === hour;

    if (bookingsLoading || classesLoading) {
        return (
            <td className="px-4 py-3">
                <div className="animate-pulse bg-gray-200 h-16 rounded"></div>
            </td>
        );
    }

    if (booking) {
        // Determinar colores según el status de la reserva y el tiempo actual
        const now = new Date();
        const bookingEnd = new Date(booking.endTime);
        const isPastBooking = bookingEnd < now;
        
        let bgColor = 'bg-blue-50';
        let borderColor = 'border-blue-300';
        let hoverBorder = 'hover:border-blue-400';
        let statusBadgeBg = 'bg-blue-200';
        let statusBadgeText = 'text-blue-800';
        let statusLabel = booking.status === 'PENDING' ? 'Pendiente' : 'Confirmada';
        
        if (booking.status === 'CANCELLED') {
            bgColor = 'bg-red-50';
            borderColor = 'border-red-300';
            hoverBorder = 'hover:border-red-400';
            statusBadgeBg = 'bg-red-200';
            statusBadgeText = 'text-red-800';
            statusLabel = 'Cancelada';
        } else if (booking.status === 'COMPLETED' || isPastBooking) {
            bgColor = 'bg-gray-50';
            borderColor = 'border-gray-300';
            hoverBorder = 'hover:border-gray-400';
            statusBadgeBg = 'bg-gray-200';
            statusBadgeText = 'text-gray-800';
            statusLabel = 'Completada';
        } else if (booking.paymentStatus === 'PAID') {
            bgColor = 'bg-green-50';
            borderColor = 'border-green-300';
            hoverBorder = 'hover:border-green-400';
            statusBadgeBg = 'bg-green-200';
            statusBadgeText = 'text-green-800';
            statusLabel = 'Pagada';
        } else if (booking.status === 'PENDING') {
            bgColor = 'bg-yellow-50';
            borderColor = 'border-yellow-300';
            hoverBorder = 'hover:border-yellow-400';
            statusBadgeBg = 'bg-yellow-200';
            statusBadgeText = 'text-yellow-800';
            statusLabel = 'Pendiente';
        }
        
        return (
            <td className="px-4 py-3">
                <div
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${bgColor} ${borderColor} ${hoverBorder}`}
                    onClick={() => onBookingClick(booking)}
                >
                    {isBookingStart ? (
                        <>
                            <div className="flex items-center gap-1 mb-1">
                                <Calendar className="h-3 w-3 text-blue-600" />
                                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">RESERVA</span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">{booking.userName}</div>
                            <div className="text-xs text-gray-600 mt-1">
                                {new Date(booking.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                {' - '}
                                {new Date(booking.endTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex gap-1 flex-wrap">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadgeBg} ${statusBadgeText}`}>
                                        {statusLabel}
                                    </span>
                                    {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && !isPastBooking && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${booking.paymentStatus === 'PAID'
                                            ? 'bg-green-200 text-green-800'
                                            : 'bg-amber-200 text-amber-800'
                                            }`}>
                                            {booking.paymentStatus === 'PAID' ? '💳 Pagado' : '⏳ Pago Pdte.'}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-600">
                                    €{booking.priceSnapshotEuros.toFixed(2)}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-xs text-gray-600">
                            <div className="font-medium">↑</div>
                            <div className="text-[10px]">Continúa</div>
                        </div>
                    )}
                </div>
            </td>
        );
    }

    // Si hay clase programada, mostrarla
    if (classItem) {
        // Determinar colores según el status de la clase y el tiempo actual
        const now = new Date();
        const classEnd = new Date(classItem.endTime);
        const classStart = new Date(classItem.startTime);
        const isPastClass = classEnd < now;
        const isOngoing = classStart <= now && now < classEnd;
        
        let bgColor = 'bg-purple-50';
        let borderColor = 'border-purple-300';
        let hoverBorder = 'hover:border-purple-400';
        let badgeBg = 'bg-purple-200';
        let badgeText = 'text-purple-800';
        let statusLabel = 'Programada';
        
        if (classItem.status === 'CANCELLED') {
            bgColor = 'bg-red-50';
            borderColor = 'border-red-300';
            hoverBorder = 'hover:border-red-400';
            badgeBg = 'bg-red-200';
            badgeText = 'text-red-800';
            statusLabel = 'Cancelada';
        } else if (classItem.status === 'COMPLETED' || isPastClass) {
            bgColor = 'bg-gray-50';
            borderColor = 'border-gray-300';
            hoverBorder = 'hover:border-gray-400';
            badgeBg = 'bg-gray-200';
            badgeText = 'text-gray-800';
            statusLabel = 'Finalizada';
        } else if (isOngoing) {
            bgColor = 'bg-indigo-50';
            borderColor = 'border-indigo-400';
            hoverBorder = 'hover:border-indigo-500';
            badgeBg = 'bg-indigo-200';
            badgeText = 'text-indigo-900';
            statusLabel = '🔴 En Curso';
        } else if (classItem.status === 'FULL') {
            bgColor = 'bg-orange-50';
            borderColor = 'border-orange-300';
            hoverBorder = 'hover:border-orange-400';
            badgeBg = 'bg-orange-200';
            badgeText = 'text-orange-800';
            statusLabel = '✓ Completa';
        } else if (classItem.status === 'OPEN') {
            bgColor = 'bg-green-50';
            borderColor = 'border-green-300';
            hoverBorder = 'hover:border-green-400';
            badgeBg = 'bg-green-200';
            badgeText = 'text-green-800';
            statusLabel = '🔓 Abierta';
        }
        
        return (
            <td className="px-4 py-3">
                <div
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${bgColor} ${borderColor} ${hoverBorder}`}
                    onClick={() => onClassClick(classItem)}
                >
                    {isClassStart ? (
                        <>
                            <div className="flex items-center gap-1 mb-1">
                                <Users className="h-3 w-3 text-purple-600" />
                                <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wide">CLASE</span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">{classItem.title || classItem.name}</div>
                            <div className="text-xs text-gray-600 mt-1">
                                {new Date(classItem.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                {' - '}
                                {new Date(classItem.endTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${badgeBg} ${badgeText}`}>
                                    {statusLabel}
                                </span>
                                <span className="text-xs text-gray-600">
                                    €{(classItem.priceCents / 100).toFixed(2)}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-xs text-gray-600">
                            <div className="font-medium">↑</div>
                            <div className="text-[10px]">Continúa</div>
                        </div>
                    )}
                </div>
            </td>
        );
    }

    return (
        <td className="px-4 py-3">
            <button
                onClick={() => onCreateBooking(pistaId, hour)}
                className="w-full h-16 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center group"
            >
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
            </button>
        </td>
    );
}
