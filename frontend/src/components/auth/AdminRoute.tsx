// ============================================================
// ADMIN ROUTE - Wrapper para rutas de administrador
// ============================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../types/authTypes';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute - Protege rutas que solo admin puede acceder
 * - Cliente redirige a /
 * - No autenticado redirige a /login
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // No autenticado → Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // No es admin → Home
  // Permitir ADMIN y GESTOR (personal del polideportivo)
  if (user?.roleName !== ROLES.ADMIN && user?.roleName !== ROLES.GESTOR) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
