// src/Operaciones/components/TablaControl.jsx

import React, { useEffect, useState } from "react";
import guides from "../data/sampleGuides";
import vehicles from "../data/sampleVehicles";
import materials from "../data/sampleMaterials";
import { ClipboardList } from "lucide-react";

const TablaControl = () => {
  const [datosControl, setDatosControl] = useState([]);

  useEffect(() => {
    // Simulando fusión de datos de guías, vehículos y materiales
    const combined = [
      ...guides.map((g) => ({ tipo: "Guía", nombre: g.nombre, estado: g.estado })),
      ...vehicles.map((v) => ({ tipo: "Vehículo", nombre: v.placa, estado: v.estado })),
      ...materials.map((m) => ({ tipo: "Material", nombre: m.nombre, estado: m.estado })),
    ];
    setDatosControl(combined);
  }, []);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <div className="flex items-center mb-6">
        <ClipboardList className="w-6 h-6 text-purple-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Tabla de Control de Recursos</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-left">Nombre / Placa</th>
              <th className="px-4 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 divide-y divide-gray-200">
            {datosControl.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2">{item.tipo}</td>
                <td className="px-4 py-2">{item.nombre}</td>
                <td className="px-4 py-2">{item.estado}</td>
              </tr>
            ))}
            {datosControl.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  No hay datos para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaControl;
