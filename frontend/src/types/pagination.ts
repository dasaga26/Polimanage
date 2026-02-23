// ============================================================
// PAGINATION TYPES - Tipos compartidos para respuestas paginadas
// ============================================================

/**
 * Metadatos de paginación retornados por el backend
 */
export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  maxPriceLimit?: number;      // Precio máximo en céntimos
  maxPriceLimitEur?: number;   // Precio máximo en euros
}

/**
 * Respuesta paginada genérica del backend
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Parámetros de paginación y filtrado para las queries
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  status?: string;
  roleId?: number;
  min_price?: number;    // En céntimos
  max_price?: number;    // En céntimos
  deporte?: string;
}
