/**
 * Formatea un precio en céntimos a formato de euros
 */
export function formatPrice(cents: number): string {
    const euros = cents / 100;
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
    }).format(euros);
}

/**
 * Formatea un precio en euros (ya dividido)
 */
export function formatEuros(euros: number): string {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
    }).format(euros);
}

/**
 * Convierte euros a céntimos
 */
export function eurosToCents(euros: number): number {
    return Math.round(euros * 100);
}

/**
 * Convierte céntimos a euros
 */
export function centsToEuros(cents: number): number {
    return cents / 100;
}

/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

/**
 * Formatea un porcentaje
 */
export function formatPercentage(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat('es-ES', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value / 100);
}
