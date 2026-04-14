import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth.jsx';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-lg text-blue-600">Cargando...</p>
    </div>
);

const ProtectedRoute = ({ children, requiredRole, requiredPermissions }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole) {
        if (!user || !user.roles) {
            return <Navigate to="/no-autorizado" state={{ from: location }} replace />;
        }
        
        const userRoles = user.roles.map(rol => 
            typeof rol === 'object' ? rol.nombre : rol
        );
        
        if (!userRoles.includes(requiredRole)) {
            return <Navigate to="/no-autorizado" state={{ from: location }} replace />;
        }
    }

    if (requiredPermissions && Array.isArray(requiredPermissions) && requiredPermissions.length > 0) {
        if (!user || !user.permisos) {
            return <Navigate to="/no-autorizado" state={{ from: location }} replace />;
        }
        const hasAllPermissions = requiredPermissions.every(perm => user.permisos.includes(perm));
        if (!hasAllPermissions) {
            return <Navigate to="/no-autorizado" state={{ from: location }} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;

