import React from 'react';
import { useAuth } from '../hooks/useAuth';

const AdminPage = () => {
    const { user } = useAuth();

    return (
        <div className="bg-white shadow-xl rounded-lg p-6 md:p-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Panel de Administración</h1>
            <p className="text-gray-700 text-lg mb-4">
                Bienvenido, <span className="font-semibold">{user?.nombre}</span>. Esta área es exclusiva para administradores.
            </p>
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-md shadow">
                <h2 className="text-xl font-semibold text-indigo-700 mb-3">Información del Administrador</h2>
                <p className="text-indigo-600"><strong>Rol:</strong> {user?.roles?.join(', ')}</p>
                <p className="text-indigo-600"><strong>Email:</strong> {user?.email}</p>
                <p className="text-indigo-600 mt-3">Aquí podrías mostrar estadísticas, configuraciones globales, gestión de usuarios, etc.</p>
            </div>

            {user?.permisos && (
                <div className="mt-8 bg-gray-50 p-6 rounded-md shadow">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Permisos Asignados ({user.permisos.length}):</h3>
                    <ul className="list-disc list-inside text-gray-600 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {user.permisos.slice(0, 15).map(permiso => <li key={permiso}>{permiso.replace(/_/g, ' ')}</li>)}
                        {user.permisos.length > 15 && <li>Y {user.permisos.length - 15} más...</li>}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
