// ============================================================
// PROTECTED ROUTE - Wrapper para rutas que requieren autenticación
// ============================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRole?: string;
}

/**
 * ProtectedRoute - Protege rutas que requieren autenticación
 * 
 * @example
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * @example con rol específico
 * <ProtectedRoute requiredRole="ADMIN">
 *   <AdminPanel />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
  requiredRole,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Mostrar loading mientras se verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Verificar rol si es requerido
  if (requiredRole && user?.roleName !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
