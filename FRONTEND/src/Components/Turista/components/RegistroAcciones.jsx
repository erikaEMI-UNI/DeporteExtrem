// src/Operaciones/components/RegistroAcciones.jsx

import React, { useEffect, useState } from "react";
import { FileClock } from "lucide-react";
import logs from "../data/initialLogs";

const RegistroAcciones = () => {
  const [acciones, setAcciones] = useState([]);

  useEffect(() => {
    // Cargar logs simulados (puedes reemplazar con fetch o API real)
    setAcciones(logs);
  }, []);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <div className="flex items-center mb-6">
        <FileClock className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Registro de Acciones</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Usuario</th>
              <th className="px-4 py-2 text-left">Acción</th>
              <th className="px-4 py-2 text-left">Detalle</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 divide-y divide-gray-200">
            {acciones.map((log, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2">{log.fecha}</td>
                <td className="px-4 py-2">{log.usuario}</td>
                <td className="px-4 py-2">{log.accion}</td>
                <td className="px-4 py-2">{log.detalle}</td>
              </tr>
            ))}
            {acciones.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No hay registros disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistroAcciones;
