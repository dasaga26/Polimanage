/**
 * Formatea una fecha ISO a formato legible en español
 */
export function formatDate(isoString: string, options?: {
    includeTime?: boolean;
    shortDate?: boolean;
    relative?: boolean;
}): string {
    const date = new Date(isoString);
    const { includeTime = false, shortDate = false, relative = false } = options || {};

    if (relative) {
        return getRelativeTimeString(date);
    }

    if (shortDate) {
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
        });
    }

    if (includeTime) {
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * Formatea solo la hora de una fecha ISO
 */
export function formatTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Retorna una cadena de tiempo relativo (hace X minutos, hace X horas, etc.)
 */
export function getRelativeTimeString(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
        return 'Hace unos segundos';
    } else if (diffMin < 60) {
        return `Hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHour < 24) {
        return `Hace ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;
    } else if (diffDay < 7) {
        return `Hace ${diffDay} ${diffDay === 1 ? 'día' : 'días'}`;
    } else {
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: Date): boolean {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}

/**
 * Verifica si una fecha está en el pasado
 */
export function isPast(date: Date): boolean {
    return date < new Date();
}

/**
 * Verifica si una fecha está en el futuro
 */
export function isFuture(date: Date): boolean {
    return date > new Date();
}

/**
 * Calcula la duración entre dos fechas en formato legible
 */
export function getDuration(startDate: Date | string, endDate: Date | string): string {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    const diffMs = end.getTime() - start.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const remainingMin = diffMin % 60;

    if (diffHour === 0) {
        return `${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
    } else if (remainingMin === 0) {
        return `${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;
    } else {
        return `${diffHour}h ${remainingMin}m`;
    }
}

/**
 * Formatea un rango de fechas
 */
export function formatDateRange(start: string, end: string): string {
    const startDate = new Date(start);
    
    if (isToday(startDate)) {
        return `Hoy ${formatTime(start)} - ${formatTime(end)}`;
    }
    
    return `${formatDate(start, { shortDate: true })} ${formatTime(start)} - ${formatTime(end)}`;
}
