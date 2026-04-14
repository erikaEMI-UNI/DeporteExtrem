//C:\Users\Hp\Desktop\erika\cod\V7_Proyect\proyec1F\FRONTEND\src\Components\Administrador\GestionFechas.jsx

import { useState, useEffect } from "react";
import { fechaService } from "../../services/fechaService";
import FechaForm from "./componentes/FechaForm";
import FechasTable from "./componentes/FechasTable";
import toast from "../../utils/toast";
export default function GestionFechas({ actividadId, actividad }) {
  const [fechas, setFechas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fechaEditando, setFechaEditando] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (actividadId) {
      cargarFechas();
    }
  }, [actividadId]);

  const cargarFechas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fechaService.getFechas(actividadId);
      setFechas(data);
    } catch (error) {
      console.error('Error cargando fechas:', error);
      setError('Error al cargar las fechas');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarFecha = async (fechaData) => {
    try {
      const nuevaFecha = await fechaService.createFecha(actividadId, fechaData);
      setFechas([nuevaFecha, ...fechas]);
      return { success: true };
    } catch (error) {
      console.error('Error al agregar fecha:', error);
      toast.error(error.error || 'Error al agregar fecha');
      return { success: false, error: error.error };
    }
  };

  const handleActualizarFecha = async (fechaId, fechaData) => {
    try {
      const fechaActualizada = await fechaService.updateFecha(actividadId, fechaId, fechaData);
      setFechas(fechas.map(f => f._id === fechaId ? fechaActualizada : f));
      setFechaEditando(null);
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar fecha:', error);
      toast.error(error.error || 'Error al actualizar fecha');
      return { success: false, error: error.error };
    }
  };

  const handleEliminarFecha = async (fechaId) => {
    if (!confirm('¿Estás seguro de eliminar esta fecha?')) return;
    
    try {
      await fechaService.deleteFecha(actividadId, fechaId);
      setFechas(fechas.filter(f => f._id !== fechaId));
      toast.success('✅ Fecha eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar fecha:', error);
      toast.error(error.error || 'Error al eliminar fecha');
    }
  };

  const handleCancelEdit = () => {
    setFechaEditando(null);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FechaForm 
        actividad={actividad}
        onSubmit={handleAgregarFecha}
        onUpdate={handleActualizarFecha}
        fechaEditando={fechaEditando}
        onCancelEdit={handleCancelEdit}

      />
      
      <FechasTable 
        fechas={fechas}
        loading={loading}
        onEdit={setFechaEditando}
        onDelete={handleEliminarFecha}
      />
    </div>
  );
}