import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center bg-gray-100 text-center px-4">
            <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-lg w-full">
                <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Acceso Denegado</h1>
                <p className="mt-4 text-lg text-gray-600">
                    No tienes los permisos necesarios para acceder a esta página o recurso.
                </p>
                <p className="mt-2 text-gray-500">
                    Si crees que esto es un error, por favor contacta al administrador del sistema.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <button
                        onClick={() => navigate(-1)} // Volver a la página anterior
                        className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Volver Atrás
                    </button>
                    <Link
                        to="/"
                        className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Ir a Inicio
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
