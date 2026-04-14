// src/Operaciones/components/ValidacionReservas.jsx

import React, { useState } from "react";
import reservasIniciales from "../data/initialReservations";
import { CheckCircle, XCircle, CalendarCheck2 } from "lucide-react";

const ValidacionReservas = () => {
  const [reservas, setReservas] = useState(reservasIniciales);

  const actualizarEstado = (id, nuevoEstado) => {
    setReservas((prev) =>
      prev.map((reserva) =>
        reserva.id === id ? { ...reserva, estado: nuevoEstado } : reserva
      )
    );
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <div className="flex items-center mb-6">
        <CalendarCheck2 className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Validación de Reservas</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-left">Actividad</th>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 divide-y divide-gray-200">
            {reservas.map((reserva) => (
              <tr key={reserva.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{reserva.cliente}</td>
                <td className="px-4 py-2">{reserva.actividad}</td>
                <td className="px-4 py-2">{reserva.fecha}</td>
                <td className="px-4 py-2">{reserva.estado}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    className="text-green-600 hover:text-green-800"
                    onClick={() => actualizarEstado(reserva.id, "Validada")}
                  >
                    <CheckCircle className="inline w-5 h-5" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => actualizarEstado(reserva.id, "Rechazada")}
                  >
                    <XCircle className="inline w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {reservas.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No hay reservas pendientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ValidacionReservas;
