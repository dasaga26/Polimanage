// ============================================================
// CLIENT ROUTE - Wrapper para rutas de cliente (no admin)
// ============================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../types/authTypes';

interface ClientRouteProps {
  children: React.ReactNode;
}

/**
 * ClientRoute - Protege rutas públicas que admin NO puede acceder
 * - Admin redirige a /admin
 * - Cliente puede acceder normalmente
 */
export const ClientRoute: React.FC<ClientRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Es admin o gestor → Redirigir a /admin
  if (user?.roleName === ROLES.ADMIN || user?.roleName === ROLES.GESTOR) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
