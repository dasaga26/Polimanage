import type { User } from '@/services/userService';
import type { Pista } from '@/services/pistaService';
import type { PaginationParams } from './pagination';

// Enrollment de un alumno en una clase
export interface ClassEnrollment {
  id: number;
  classId: number;
  classSlug?: string;
  userId: string; // UUID
  userSlug?: string;
  userName?: string;
  userEmail?: string;
  enrolledAt: string;
  registeredAt?: string;
  status?: string;
  user?: User;
}

// Clase completa con relaciones
export interface Class {
  id: number;
  slug: string;
  title?: string;
  name: string;
  instructorId: string; // UUID
  instructorSlug?: string;
  instructorName?: string;
  pistaId: number;
  pistaName?: string;
  maxCapacity?: number;
  capacity?: number;
  priceCents: number;
  startTime: string;
  endTime: string;
  status?: 'OPEN' | 'FULL' | 'CANCELLED' | 'COMPLETED';
  isActive: boolean;
  instructor?: User;
  pista?: Pista;
  enrollments?: ClassEnrollment[];
  createdAt?: string;
  updatedAt?: string;
}

// DTO para crear una nueva clase
export interface CreateClassDTO {
  title: string;  // Changed from 'name' to match backend
  instructorId: string; // UUID
  pistaId: number;
  maxCapacity: number;
  priceCents: number;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  status?: 'OPEN' | 'FULL' | 'CANCELLED' | 'COMPLETED';
  isActive?: boolean;
}

/**
 * Parámetros de query para filtrar y paginar clases
 * Extiende PaginationParams con campos específicos de clases
 */
export interface ClassQueryParams extends PaginationParams {
  // Hereda: page, limit, search, sort, status, deporte, min_price, max_price
}
