import React, { useState } from 'react';

const EstadoActividades = ({ addLog }) => {
  const [activities, setActivities] = useState([
    { id: 1, nombre: 'Verificar equipos', estado: 'pendiente' },
    { id: 2, nombre: 'Confirmar reservas', estado: 'en progreso' },
    { id: 3, nombre: 'Revisión de seguridad', estado: 'completada' }
  ]);

  const cambiarEstado = (id, nuevoEstado) => {
    const actualizadas = activities.map((act) =>
      act.id === id ? { ...act, estado: nuevoEstado } : act
    );
    setActivities(actualizadas);
    if (addLog) addLog(`Estado de "${id}" cambiado a "${nuevoEstado}"`);
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Estado de Actividades</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th>Actividad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((act) => (
            <tr key={act.id} className="border-b">
              <td className="py-2">{act.nombre}</td>
              <td>{act.estado}</td>
              <td>
                <select
                  value={act.estado}
                  onChange={(e) => cambiarEstado(act.id, e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en progreso">En progreso</option>
                  <option value="completada">Completada</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EstadoActividades;
