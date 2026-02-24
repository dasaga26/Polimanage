// ============================================================
// GUARD AUTH - Protege rutas que requieren autenticación
// Redirige a /login si el usuario no está autenticado
// ============================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface GuardAuthProps {
    children: React.ReactNode;
    redirectTo?: string;
}

/**
 * GuardAuth - Guard de autenticación.
 * Permite el acceso únicamente a usuarios autenticados (cualquier rol).
 * Si no está autenticado, redirige a /login.
 *
 * @example
 * <GuardAuth>
 *   <MyProfilePage />
 * </GuardAuth>
 */
const GuardAuth: React.FC<GuardAuthProps> = ({ children, redirectTo = '/login' }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};

export default GuardAuth;
