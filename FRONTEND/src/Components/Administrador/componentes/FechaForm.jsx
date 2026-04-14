//C:\Users\Hp\Desktop\erika\cod\V7_Proyect\proyec1F\FRONTEND\src\Components\Administrador\components\FechaForm.jsx

import { useState, useEffect } from "react";
import toast from "../../../utils/toast";

// Iconos
const Calendar = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const Plus = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14m-7-7h14" />
  </svg>
);

const X = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export default function FechaForm({ actividad, onSubmit, onUpdate, fechaEditando, onCancelEdit }) {
  // Estado inicial con estructura segura
  const [formData, setFormData] = useState({
    fechaInicio: '',
    fechaFin: '',
    capacidadDisponible: 20,
    riesgos: {
      bajo: { activo: false, precio: '' },
      medio: { activo: false, precio: '' },
      alto: { activo: false, precio: '' }
    },
    estado: 'activa'
  });

  const [duracionCalculada, setDuracionCalculada] = useState('');

  // Cargar datos si estamos editando
  useEffect(() => {
    if (fechaEditando) {
      console.log('Datos de fecha a editar:', fechaEditando);
      
      // Crear estructura de riesgos por defecto
      const riesgosIniciales = {
        bajo: { activo: false, precio: '' },
        medio: { activo: false, precio: '' },
        alto: { activo: false, precio: '' }
      };

      // Si existen riesgos en la fecha a editar, mapearlos
      if (fechaEditando.riesgos && Array.isArray(fechaEditando.riesgos)) {
        fechaEditando.riesgos.forEach(riesgo => {
          if (riesgo && riesgo.nivel) {
            const nivelKey = riesgo.nivel.toLowerCase();
            if (riesgosIniciales[nivelKey]) {
              riesgosIniciales[nivelKey] = {
                activo: true,
                precio: riesgo.precio || ''
              };
            }
          }
        });
      }

      setFormData({
        fechaInicio: fechaEditando.fechaInicio ? fechaEditando.fechaInicio.slice(0, 16) : '',
        fechaFin: fechaEditando.fechaFin ? fechaEditando.fechaFin.slice(0, 16) : '',
        capacidadDisponible: fechaEditando.capacidadDisponible || 20,
        riesgos: riesgosIniciales,
        estado: fechaEditando.estado || 'activa'
      });
    } else {
      // Resetear formulario
      resetForm();
    }
  }, [fechaEditando]);

  // Calcular duración cuando cambian las fechas
  useEffect(() => {
    if (formData.fechaInicio && formData.fechaFin) {
      const inicio = new Date(formData.fechaInicio);
      const fin = new Date(formData.fechaFin);
      
      if (fin > inicio) {
        const diffMs = fin - inicio;
        const diffHoras = diffMs / (1000 * 60 * 60);
        
        if (diffHoras < 24) {
          setDuracionCalculada(`${Math.round(diffHoras * 10) / 10} horas`);
        } else {
          const dias = Math.floor(diffHoras / 24);
          const horasRestantes = Math.round((diffHoras % 24) * 10) / 10;
          setDuracionCalculada(horasRestantes > 0 ? `${dias} días ${horasRestantes} horas` : `${dias} días`);
        }
      } else {
        setDuracionCalculada('Fecha fin debe ser posterior');
      }
    } else {
      setDuracionCalculada('');
    }
  }, [formData.fechaInicio, formData.fechaFin]);

  const resetForm = () => {
    setFormData({
      fechaInicio: '',
      fechaFin: '',
      capacidadDisponible: 20,
      riesgos: {
        bajo: { activo: false, precio: '' },
        medio: { activo: false, precio: '' },
        alto: { activo: false, precio: '' }
      },
      estado: 'activa'
    });
    setDuracionCalculada('');
  };

  const handleRiesgoChange = (nivel, field, value) => {
    setFormData(prev => ({
      ...prev,
      riesgos: {
        ...prev.riesgos,
        [nivel]: {
          ...prev.riesgos[nivel],
          [field]: value
        }
      }
    }));
  };

  const validateForm = () => {
    console.log('Validando formulario:', formData);


    if (!formData.fechaInicio || !formData.fechaFin) {
      toast.error('❌ Fecha de inicio y fin son requeridas');
      return false;
    }

    const inicio = new Date(formData.fechaInicio);
    const fin = new Date(formData.fechaFin);
    
    if (fin <= inicio) {
      toast.error('❌ La fecha de fin debe ser posterior a la fecha de inicio');
      return false;
    }

    if (formData.capacidadDisponible <= 0) {
      toast.error('❌ La capacidad debe ser mayor a 0');
      return false;
    }

    // Validar que al menos un riesgo esté seleccionado
    const riesgosSeleccionados = Object.entries(formData.riesgos)
        .filter(([_, data]) => data && data.activo === true); 

    console.log('Riesgos seleccionados:', riesgosSeleccionados);

    if (riesgosSeleccionados.length === 0) {
      toast.error('❌ Debes seleccionar al menos un nivel de riesgo');
      return false;
    }

    // Validar precios
    for (const [nivel, data] of Object.entries(formData.riesgos)) {
      if (data && data.activo) {
        if (!data.precio || parseFloat(data.precio) < 0) {
          toast.error(`❌ Precio inválido para nivel ${nivel}`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Preparar datos para enviar
    const riesgosData = Object.entries(formData.riesgos)
      .filter(([_, data]) => data && data.activo === true)
      .map(([nivel, data]) => ({
        nivel: nivel.charAt(0).toUpperCase() + nivel.slice(1),
        precio: parseFloat(data.precio)
      }));

    const fechaData = {
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin,
      capacidadDisponible: formData.capacidadDisponible,
      riesgos: riesgosData,
      estado: formData.estado
    };

    console.log('Enviando datos:', fechaData);

    let result;
    if (fechaEditando) {
      result = await onUpdate(fechaEditando._id, fechaData);
      if (result?.success) {
        onCancelEdit();
        resetForm();
      }
    } else {
      result = await onSubmit(fechaData);
      if (result?.success) {
        resetForm();
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h5 className="font-semibold text-gray-800 flex items-center gap-2">
          <Calendar size={18} />
          {fechaEditando ? '✏️ Editar fecha' : '➕ Agregar nueva fecha'}
        </h5>
        {fechaEditando && (
          <button
            onClick={() => {
              onCancelEdit();
              resetForm();
            }}
            className="text-gray-500 hover:text-gray-700"
            type="button"
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha y hora de inicio *
            </label>
            <input
              type="datetime-local"
              value={formData.fechaInicio}
              onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha y hora de fin *
            </label>
            <input
              type="datetime-local"
              value={formData.fechaFin}
              onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Duración calculada */}
        {duracionCalculada && (
          <div className="p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Duración calculada:</span>{' '}
              <span className="text-blue-600 font-bold">
                {duracionCalculada}
              </span>
            </p>
          </div>
        )}

        {/* Capacidad */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Capacidad disponible *
          </label>
          <input
            type="number"
            min="1"
            max={actividad?.capacidadMaxima || 999}
            value={formData.capacidadDisponible}
            onChange={(e) => setFormData({...formData, capacidadDisponible: parseInt(e.target.value) || 1})}
            className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Máximo: {actividad?.capacidadMaxima || 999} personas
          </p>
        </div>

        {/* Niveles de riesgo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Niveles de riesgo disponibles *
          </label>
          
          <div className="space-y-3">
            {['bajo', 'medio', 'alto'].map((nivel) => {
              // Asegurar que el nivel existe en riesgos
              const nivelData = formData.riesgos[nivel] || { activo: false, precio: '' };
              
              return (
                <div key={nivel} className="flex items-start gap-4 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center min-w-[100px]">
                    <input
                      type="checkbox"
                      id={`riesgo-${nivel}`}
                      checked={nivelData.activo === true}
                      onChange={(e) => handleRiesgoChange(nivel, 'activo', e.target.checked)}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <label htmlFor={`riesgo-${nivel}`} className="ml-3 text-sm font-medium text-gray-700">
                      {nivel === 'bajo' && '🟢 Bajo'}
                      {nivel === 'medio' && '🟡 Medio'}
                      {nivel === 'alto' && '🔴 Alto'}
                    </label>
                  </div>
                  
                  {nivelData.activo && (
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Precio (Bs)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={nivelData.precio || ''}
                        onChange={(e) => handleRiesgoChange(nivel, 'precio', e.target.value)}
                        className="w-full max-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        required={nivelData.activo}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Estado inicial
          </label>
          <select
            value={formData.estado}
            onChange={(e) => setFormData({...formData, estado: e.target.value})}
            className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="activa">🟢 Activa</option>
            <option value="inactiva">⚪ Inactiva</option>
            <option value="cancelada">🔴 Cancelada</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all shadow-lg flex items-center gap-2"
        >
          <Plus size={20} />
          {fechaEditando ? 'Actualizar Fecha' : 'Agregar Fecha'}
        </button>
      </form>
    </div>
  );
}