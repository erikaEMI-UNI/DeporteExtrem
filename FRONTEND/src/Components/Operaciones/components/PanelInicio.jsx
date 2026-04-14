// src/Operaciones/components/PanelInicio.jsx

import React from "react";
import { ClipboardList, CalendarCheck, AlertTriangle, FileText } from "lucide-react";

const PanelInicio = () => {
  const items = [
    {
      icon: <ClipboardList className="w-8 h-8 text-indigo-600" />,
      title: "Gestión de Itinerarios",
      description: "Organiza horarios, guías, vehículos y materiales para las actividades.",
    },
    {
      icon: <CalendarCheck className="w-8 h-8 text-green-600" />,
      title: "Validación de Reservas",
      description: "Confirma o rechaza reservas pendientes de forma eficiente.",
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-yellow-600" />,
      title: "Estado de Actividades",
      description: "Revisa el estado actualizado de cada actividad y disponibilidad.",
    },
    {
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      title: "Registro de Acciones",
      description: "Consulta el historial de acciones realizadas en el sistema.",
    },
  ];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Bienvenido al Panel de Operaciones</h2>
      <p className="text-gray-600 mb-8">
        Aquí puedes gestionar las tareas clave del área de operaciones de forma organizada.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, index) => (
          <div key={index} className="flex items-start bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition">
            <div className="mr-4">{item.icon}</div>
            <div>
              <h3 className="text-lg font-medium text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PanelInicio;
