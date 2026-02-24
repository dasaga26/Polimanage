// ============================================================
// GUARD ADMIN - Protege rutas que requieren rol de administrador
// Redirige a /login si no está autenticado, a / si no es admin
// ============================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../types/authTypes';

interface GuardAdminProps {
  children: React.ReactNode;
}

/**
 * GuardAdmin - Guard de rol administrativo.
 * Permite el acceso únicamente a usuarios con rol ADMIN o GESTOR.
 * - No autenticado → redirige a /login
 * - Autenticado sin rol admin → redirige a /
 *
 * @example
 * <GuardAdmin>
 *   <Dashboard />
 * </GuardAdmin>
 */
const GuardAdmin: React.FC<GuardAdminProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.roleName !== ROLES.ADMIN && user?.roleName !== ROLES.GESTOR) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default GuardAdmin;
