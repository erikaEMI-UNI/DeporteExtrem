///C:\Users\Hp\Desktop\erika\cod\V7_Proyect\proyec1F\FRONTEND\src\Components\Administrador\components\FechasTable.jsx

import { useState } from "react";

// Iconos
const Edit = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const Trash = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const Calendar = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const getNivelRiesgoColor = (nivel) => {
  switch (nivel) {
    case "Alto":
      return "bg-red-100 text-red-700 border-red-200";
    case "Medio":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Bajo":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export default function FechasTable({ fechas, loading, onEdit, onDelete }) {
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const fechasFiltradas = filtroEstado === 'todos' 
    ? fechas 
    : fechas.filter(f => f.estado === filtroEstado);

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-BO', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Cargando fechas...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Calendar size={20} className="text-blue-600" />
          Fechas configuradas
        </h4>
        
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="todos">Todos los estados</option>
          <option value="activa">Activas</option>
          <option value="inactiva">Inactivas</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Duración</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Riesgos disponibles</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Capacidad</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {fechasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <Calendar className="text-gray-300 mb-2" size={32} />
                    <p>No hay fechas configuradas</p>
                    <p className="text-sm">Agrega una fecha usando el formulario superior</p>
                  </div>
                </td>
              </tr>
            ) : (
              fechasFiltradas.map((fecha) => (
                <tr key={fecha._id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{fecha.duracion || 'N/A'}</p>
                      <p className="text-xs text-gray-500">
                        {formatFecha(fecha.fechaInicio)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFecha(fecha.fechaFin)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                        {/*“Si riesgos existe, es un array y tiene elementos… entonces renderiza esto” */}
                        {fecha.riesgos && Array.isArray(fecha.riesgos) && fecha.riesgos.length > 0 ? (

                        fecha.riesgos.map((riesgo, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getNivelRiesgoColor(riesgo.nivel)}`}
                          >
                            {riesgo.nivel === 'Bajo' && '🟢 '}
                            {riesgo.nivel === 'Medio' && '🟡 '}
                            {riesgo.nivel === 'Alto' && '🔴 '}
                            Bs{riesgo.precio}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">Sin riesgos</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium">{fecha.capacidadDisponible || 0} pers.</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                      fecha.estado === 'activa' ? 'bg-green-100 text-green-700' :
                      fecha.estado === 'inactiva' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {fecha.estado === 'activa' ? '🟢 Activa' :
                       fecha.estado === 'inactiva' ? '⚪ Inactiva' : '🔴 Cancelada'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          console.log('Editando fecha:', fecha);
                          onEdit(fecha);
                        }}
                        className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Editar"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(fecha._id)}
                        className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Eliminar"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Total: {fechasFiltradas.length} {fechasFiltradas.length === 1 ? 'fecha' : 'fechas'}
      </div>
    </div>
  );
}