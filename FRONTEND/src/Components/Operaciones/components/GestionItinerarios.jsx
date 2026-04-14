"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import toast from "../../../utils/toast";
import {
  ClipboardList,
  Calendar,
  MapPin,
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Wrench,
} from "lucide-react";

// Configuración de axios
const API_BASE_URL = "/api";

// Configurar interceptor para incluir token en todas las peticiones
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const GestionItinerarios = () => {
  const { user } = useAuth();
  const [itinerarios, setItinerarios] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroRecurso, setFiltroRecurso] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingItinerario, setEditingItinerario] = useState(null);
  const [viewingItinerario, setViewingItinerario] = useState(null);
  const [newItinerario, setNewItinerario] = useState({
    recurso: "Vehiculo",
    referencia: "",
    actividad: "",
    estado: "Libre",
    fechaInicio: "",
    fechaFin: "",
    observaciones: "",
  });

  // Verificación de permisos
  const puedeCrear = user?.permisos?.includes("crear_itinerario");
  const puedeVer = user?.permisos?.includes("ver_itinerarios");
  const puedeEditar = user?.permisos?.includes("editar_itinerario");
  const puedeEliminar = user?.permisos?.includes("eliminar_itinerario");

  const puedeAccionar = [
    "ver_itinerarios",
    "editar_itinerario",
    "eliminar_itinerario",
  ].some((p) => user?.permisos?.includes(p));

  const token = localStorage.getItem("authToken") || user?.token;

  const estados = ["Libre", "Ocupado", "Mantenimiento"];
  const tiposRecurso = ["Vehiculo", "Guia", "Equipo"];

  // Sugerencias de recursos para ayudar al usuario
  const sugerenciasRecursos = {
    Vehiculo: [
      "Bus Turístico 001 - ABC-123",
      "Van Ejecutiva - DEF-456",
      "Minibus - GHI-789",
      "Automóvil Sedan - JKL-012",
      "Camioneta 4x4 - MNO-345",
    ],
    Guia: [
      "Carlos Mendoza - Turismo Cultural",
      "Ana García - Ecoturismo",
      "Luis Rodríguez - Turismo Aventura",
      "María López - Turismo Gastronómico",
      "Pedro Sánchez - Turismo Histórico",
    ],
    Equipo: [
      "Cámara Profesional Canon EOS R5",
      "Kit de Primeros Auxilios Completo",
      "Proyector HD Epson",
      "Sistema de Comunicación Radial",
    ],
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (token) {
      cargarDatos();
    }
  }, [token]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const promises = [];

      // Cargar itinerarios si tiene permisos
      if (puedeVer) {
        promises.push(axios.get(`${API_BASE_URL}/itinerarios`));
      }

      // Cargar actividades si existe la API
      if (puedeCrear || puedeEditar) {
        try {
          promises.push(axios.get(`${API_BASE_URL}/actividades`));
        } catch (error) {
          console.log("API de actividades no disponible");
        }
      }

      const responses = await Promise.all(promises);
      let responseIndex = 0;

      if (puedeVer) {
        setItinerarios(responses[responseIndex].data);
        responseIndex++;
      }

      if (puedeCrear || puedeEditar) {
        // Usar actividades de la API si está disponible, sino usar array vacío
        setActividades(responses[responseIndex]?.data || []);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      setActividades([]);
    } finally {
      setLoading(false);
    }
  };

  const crearItinerario = async () => {
    if (!puedeCrear) {
      toast.error("No tienes permisos para crear itinerarios");
      return;
    }

    if (!newItinerario.referencia.trim()) {
      toast.error("La referencia del recurso es obligatoria");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/itinerarios`,
        newItinerario
      );
      setItinerarios([...itinerarios, response.data]);
      setIsCreateModalOpen(false);
      resetNewItinerario();
      toast.success("Itinerario creado correctamente");
    } catch (error) {
      console.error("Error creando itinerario:", error);
      toast.error(error.response?.data?.error || "Error al crear itinerario");
    }
  };

  const editarItinerario = async () => {
    if (!puedeEditar) {
      toast.error("No tienes permisos para editar itinerarios");
      return;
    }

    if (!editingItinerario) return;

    if (!editingItinerario.referencia.trim()) {
      toast.error("La referencia del recurso es obligatoria");
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/itinerarios/${editingItinerario._id}`,
        editingItinerario
      );
      setItinerarios(
        itinerarios.map((itinerario) =>
          itinerario._id === editingItinerario._id ? response.data : itinerario
        )
      );
      setIsEditModalOpen(false);
      setEditingItinerario(null);
      toast.success("Itinerario actualizado correctamente");
    } catch (error) {
      console.error("Error editando itinerario:", error);
      toast.error(error.response?.data?.error || "Error al editar itinerario");
    }
  };

  const eliminarItinerario = async (itinerario) => {
    if (!puedeEliminar) {
      toast.error("No tienes permisos para eliminar itinerarios");
      return;
    }

    if (
      !confirm(
        `¿Estás seguro de eliminar el itinerario de ${itinerario.recurso}: ${itinerario.referencia}?`
      )
    ) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/itinerarios/${itinerario._id}`);
      setItinerarios(itinerarios.filter((i) => i._id !== itinerario._id));
      toast.success("Itinerario eliminado correctamente");
    } catch (error) {
      console.error("Error eliminando itinerario:", error);
      toast.error(error.response?.data?.error || "Error al eliminar itinerario");
    }
  };

  const resetNewItinerario = () => {
    setNewItinerario({
      recurso: "Vehiculo",
      referencia: "",
      actividad: "",
      estado: "Libre",
      fechaInicio: "",
      fechaFin: "",
      observaciones: "",
    });
  };

  const abrirCrearItinerario = () => {
    if (!puedeCrear) {
      toast.error("No tienes permisos para crear itinerarios");
      return;
    }
    resetNewItinerario();
    setIsCreateModalOpen(true);
  };

  const abrirEditarItinerario = (itinerario) => {
    if (!puedeEditar) {
      toast.error("No tienes permisos para editar itinerarios");
      return;
    }
    setEditingItinerario({
      ...itinerario,
      fechaInicio: new Date(itinerario.fechaInicio).toISOString().slice(0, 16),
      fechaFin: new Date(itinerario.fechaFin).toISOString().slice(0, 16),
    });
    setIsEditModalOpen(true);
  };

  const abrirVerItinerario = (itinerario) => {
    if (!puedeVer) {
      toast.error("No tienes permisos para ver itinerarios");
      return;
    }
    setViewingItinerario(itinerario);
    setIsViewModalOpen(true);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Libre":
        return "bg-green-100 text-green-800";
      case "Ocupado":
        return "bg-red-100 text-red-800";
      case "Mantenimiento":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "Libre":
        return <CheckCircle className="w-4 h-4" />;
      case "Ocupado":
        return <AlertCircle className="w-4 h-4" />;
      case "Mantenimiento":
        return <Wrench className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const itinerariosFiltrados = itinerarios.filter((itinerario) => {
    const matchFiltro =
      itinerario.recurso.toLowerCase().includes(filtro.toLowerCase()) ||
      itinerario.referencia.toLowerCase().includes(filtro.toLowerCase()) ||
      (itinerario.actividad?.nombre || "")
        .toLowerCase()
        .includes(filtro.toLowerCase()) ||
      (itinerario.observaciones || "")
        .toLowerCase()
        .includes(filtro.toLowerCase());

    const matchEstado =
      filtroEstado === "" || itinerario.estado === filtroEstado;
    const matchRecurso =
      filtroRecurso === "" || itinerario.recurso === filtroRecurso;

    return matchFiltro && matchEstado && matchRecurso;
  });

  // Mensaje de permisos insuficientes
  if (!puedeVer && !puedeCrear) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-md">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
          <svg
            className="w-5 h-5 text-orange-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span className="text-orange-700">
            No tienes los permisos necesarios para gestionar itinerarios.
            Contacta a un administrador.
          </span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-md">
        <div className="flex items-center justify-center h-32">
          <div className="text-lg">Cargando itinerarios...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <ClipboardList className="w-6 h-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">
            Gestión de Itinerarios
          </h2>
        </div>
        {puedeCrear && (
          <button
            onClick={abrirCrearItinerario}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Itinerario
          </button>
        )}
      </div>

      {/* Filtros */}
      {puedeVer && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Buscar itinerarios..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <div>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="">Todos los estados</option>
              {estados.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filtroRecurso}
              onChange={(e) => setFiltroRecurso(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="">Todos los recursos</option>
              {tiposRecurso.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            Total: {itinerariosFiltrados.length} itinerarios
          </div>
        </div>
      )}

      {/* Tabla de itinerarios */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="px-4 py-3 text-left">Recurso</th>
              <th className="px-4 py-3 text-left">Referencia</th>
              <th className="px-4 py-3 text-left">Actividad</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Fecha Inicio</th>
              <th className="px-4 py-3 text-left">Fecha Fin</th>
              <th className="px-4 py-3 text-left">Observaciones</th>
              {puedeAccionar && (
                <th className="px-4 py-3 text-left">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 divide-y divide-gray-200">
            {itinerariosFiltrados.length === 0 ? (
              <tr>
                <td
                  colSpan={puedeAccionar ? "8" : "7"}
                  className="text-center py-8 text-gray-500"
                >
                  No hay itinerarios que coincidan con los filtros
                </td>
              </tr>
            ) : (
              itinerariosFiltrados.map((itinerario) => (
                <tr key={itinerario._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                        {itinerario.recurso === "Vehiculo" && (
                          <svg
                            className="w-4 h-4 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0"
                            />
                          </svg>
                        )}
                        {itinerario.recurso === "Guia" && (
                          <svg
                            className="w-4 h-4 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        )}
                        {itinerario.recurso === "Equipo" && (
                          <svg
                            className="w-4 h-4 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium">{itinerario.recurso}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">
                      {itinerario.referencia || "Sin referencia"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-900">
                      {itinerario.actividad?.nombre || "Sin actividad"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(
                        itinerario.estado
                      )}`}
                    >
                      {getEstadoIcon(itinerario.estado)}
                      <span className="ml-1">{itinerario.estado}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {new Date(itinerario.fechaInicio).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {new Date(itinerario.fechaFin).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs truncate">
                      {itinerario.observaciones || (
                        <span className="text-gray-400 text-xs">
                          Sin observaciones
                        </span>
                      )}
                    </div>
                  </td>
                  {puedeAccionar && (
                    <td className="px-4 py-3">
                      <div className="flex space-x-1">
                        {puedeVer && (
                          <button
                            onClick={() => abrirVerItinerario(itinerario)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {puedeEditar && (
                          <button
                            onClick={() => abrirEditarItinerario(itinerario)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {puedeEliminar && (
                          <button
                            onClick={() => eliminarItinerario(itinerario)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para crear itinerario */}
      {isCreateModalOpen && puedeCrear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl transform transition-all duration-300 animate-slideUp">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Crear Nuevo Itinerario
                  </h3>
                  <p className="text-indigo-100 text-sm">
                    Programa recursos para actividades
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Información del Recurso */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        Información del Recurso
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Selecciona el tipo y especifica el recurso
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Tipo de Recurso */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Recurso *
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={newItinerario.recurso}
                        onChange={(e) => {
                          setNewItinerario({
                            ...newItinerario,
                            recurso: e.target.value,
                            referencia: "", // Reset referencia cuando cambia el tipo
                          });
                        }}
                      >
                        {tiposRecurso.map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Referencia del Recurso */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Referencia del {newItinerario.recurso} *
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={`Ej: ${
                          sugerenciasRecursos[newItinerario.recurso][0]
                        }`}
                        value={newItinerario.referencia}
                        onChange={(e) =>
                          setNewItinerario({
                            ...newItinerario,
                            referencia: e.target.value,
                          })
                        }
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Especifica el nombre, placa, modelo o identificación del{" "}
                        {newItinerario.recurso.toLowerCase()}
                      </p>
                    </div>

                    {/* Sugerencias */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sugerencias:
                      </label>
                      <div className="space-y-1">
                        {sugerenciasRecursos[newItinerario.recurso]
                          .slice(0, 3)
                          .map((sugerencia, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() =>
                                setNewItinerario({
                                  ...newItinerario,
                                  referencia: sugerencia,
                                })
                              }
                              className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              {sugerencia}
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Actividad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actividad
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={newItinerario.actividad}
                        onChange={(e) =>
                          setNewItinerario({
                            ...newItinerario,
                            actividad: e.target.value,
                          })
                        }
                      >
                        <option value="">Sin actividad específica</option>
                        {actividades.map((actividad) => (
                          <option key={actividad._id} value={actividad._id}>
                            {actividad.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado *
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={newItinerario.estado}
                        onChange={(e) =>
                          setNewItinerario({
                            ...newItinerario,
                            estado: e.target.value,
                          })
                        }
                      >
                        {estados.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Información Temporal */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        Información Temporal
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Define el período del itinerario
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Fecha y Hora de Inicio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha y Hora de Inicio *
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={newItinerario.fechaInicio}
                        onChange={(e) =>
                          setNewItinerario({
                            ...newItinerario,
                            fechaInicio: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Fecha y Hora de Fin */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha y Hora de Fin *
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={newItinerario.fechaFin}
                        onChange={(e) =>
                          setNewItinerario({
                            ...newItinerario,
                            fechaFin: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Observaciones */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observaciones
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows="4"
                        value={newItinerario.observaciones}
                        onChange={(e) =>
                          setNewItinerario({
                            ...newItinerario,
                            observaciones: e.target.value,
                          })
                        }
                        placeholder="Notas adicionales sobre el itinerario..."
                      />
                    </div>

                    {/* Duración calculada */}
                    {newItinerario.fechaInicio && newItinerario.fechaFin && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              Duración del Itinerario
                            </p>
                            <p className="text-xs text-blue-600">
                              {(() => {
                                const inicio = new Date(
                                  newItinerario.fechaInicio
                                );
                                const fin = new Date(newItinerario.fechaFin);
                                const duracion = fin - inicio;
                                const horas = Math.floor(
                                  duracion / (1000 * 60 * 60)
                                );
                                const minutos = Math.floor(
                                  (duracion % (1000 * 60 * 60)) / (1000 * 60)
                                );
                                return `${horas} horas y ${minutos} minutos`;
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Campos obligatorios:</span> Tipo
                de Recurso, Referencia, Estado, Fechas
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={crearItinerario}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  Crear Itinerario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar itinerario */}
      {isEditModalOpen && editingItinerario && puedeEditar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl transform transition-all duration-300 animate-slideUp">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Editar Itinerario
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Modificar información del itinerario
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content - Similar al modal de crear pero con datos de editingItinerario */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Información del Recurso */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        Información del Recurso
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Modificar tipo y especifica el recurso
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Tipo de Recurso */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Recurso *
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={editingItinerario.recurso}
                        onChange={(e) => {
                          setEditingItinerario({
                            ...editingItinerario,
                            recurso: e.target.value,
                            referencia: "", // Reset referencia cuando cambia el tipo
                          });
                        }}
                      >
                        {tiposRecurso.map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Referencia del Recurso */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Referencia del {editingItinerario.recurso} *
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Ej: ${
                          sugerenciasRecursos[editingItinerario.recurso][0]
                        }`}
                        value={editingItinerario.referencia}
                        onChange={(e) =>
                          setEditingItinerario({
                            ...editingItinerario,
                            referencia: e.target.value,
                          })
                        }
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Especifica el nombre, placa, modelo o identificación del{" "}
                        {editingItinerario.recurso.toLowerCase()}
                      </p>
                    </div>

                    {/* Sugerencias */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sugerencias:
                      </label>
                      <div className="space-y-1">
                        {sugerenciasRecursos[editingItinerario.recurso]
                          .slice(0, 3)
                          .map((sugerencia, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() =>
                                setEditingItinerario({
                                  ...editingItinerario,
                                  referencia: sugerencia,
                                })
                              }
                              className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              {sugerencia}
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Actividad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actividad
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={editingItinerario.actividad}
                        onChange={(e) =>
                          setEditingItinerario({
                            ...editingItinerario,
                            actividad: e.target.value,
                          })
                        }
                      >
                        <option value="">Sin actividad específica</option>
                        {actividades.map((actividad) => (
                          <option key={actividad._id} value={actividad._id}>
                            {actividad.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado *
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={editingItinerario.estado}
                        onChange={(e) =>
                          setEditingItinerario({
                            ...editingItinerario,
                            estado: e.target.value,
                          })
                        }
                      >
                        {estados.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Información Temporal */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        Información Temporal
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Modificar el período del itinerario
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Fecha y Hora de Inicio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha y Hora de Inicio *
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={editingItinerario.fechaInicio}
                        onChange={(e) =>
                          setEditingItinerario({
                            ...editingItinerario,
                            fechaInicio: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Fecha y Hora de Fin */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha y Hora de Fin *
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={editingItinerario.fechaFin}
                        onChange={(e) =>
                          setEditingItinerario({
                            ...editingItinerario,
                            fechaFin: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Observaciones */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observaciones
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="4"
                        value={editingItinerario.observaciones || ""}
                        onChange={(e) =>
                          setEditingItinerario({
                            ...editingItinerario,
                            observaciones: e.target.value,
                          })
                        }
                        placeholder="Notas adicionales sobre el itinerario..."
                      />
                    </div>

                    {/* Duración calculada */}
                    {editingItinerario.fechaInicio &&
                      editingItinerario.fechaFin && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <Clock className="w-5 h-5 text-blue-600 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-blue-800">
                                Duración del Itinerario
                              </p>
                              <p className="text-xs text-blue-600">
                                {(() => {
                                  const inicio = new Date(
                                    editingItinerario.fechaInicio
                                  );
                                  const fin = new Date(
                                    editingItinerario.fechaFin
                                  );
                                  const duracion = fin - inicio;
                                  const horas = Math.floor(
                                    duracion / (1000 * 60 * 60)
                                  );
                                  const minutos = Math.floor(
                                    (duracion % (1000 * 60 * 60)) / (1000 * 60)
                                  );
                                  return `${horas} horas y ${minutos} minutos`;
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Editando:</span> Itinerario de{" "}
                {editingItinerario.recurso}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={editarItinerario}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver itinerario */}
      {isViewModalOpen && viewingItinerario && puedeVer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl transform transition-all duration-300 animate-slideUp">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-gray-600 to-gray-800 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Detalles del Itinerario
                  </h3>
                  <p className="text-gray-200 text-sm">
                    Información completa del itinerario
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Información del Recurso */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        Información del Recurso
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Detalles del recurso asignado
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Recurso
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                            {viewingItinerario.recurso === "Vehiculo" && (
                              <svg
                                className="w-4 h-4 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0"
                                />
                              </svg>
                            )}
                            {viewingItinerario.recurso === "Guia" && (
                              <svg
                                className="w-4 h-4 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            )}
                            {viewingItinerario.recurso === "Equipo" && (
                              <svg
                                className="w-4 h-4 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">
                            {viewingItinerario.recurso}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recurso Específico
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-gray-900 font-medium">
                          {viewingItinerario.referencia || "Sin referencia"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Actividad Asignada
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-gray-900">
                          {viewingItinerario.actividad?.nombre ||
                            "Sin actividad específica"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado Actual
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(
                            viewingItinerario.estado
                          )}`}
                        >
                          {getEstadoIcon(viewingItinerario.estado)}
                          <span className="ml-2">
                            {viewingItinerario.estado}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información Temporal */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        Información Temporal
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Período del itinerario
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha y Hora de Inicio
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-gray-900 font-medium">
                          {new Date(
                            viewingItinerario.fechaInicio
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha y Hora de Fin
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-gray-900 font-medium">
                          {new Date(
                            viewingItinerario.fechaFin
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duración Total
                      </label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              {(() => {
                                const inicio = new Date(
                                  viewingItinerario.fechaInicio
                                );
                                const fin = new Date(
                                  viewingItinerario.fechaFin
                                );
                                const duracion = fin - inicio;
                                const horas = Math.floor(
                                  duracion / (1000 * 60 * 60)
                                );
                                const minutos = Math.floor(
                                  (duracion % (1000 * 60 * 60)) / (1000 * 60)
                                );
                                return `${horas} horas y ${minutos} minutos`;
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observaciones
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg border max-h-32 overflow-y-auto">
                        {viewingItinerario.observaciones ? (
                          <p className="text-gray-900 whitespace-pre-wrap">
                            {viewingItinerario.observaciones}
                          </p>
                        ) : (
                          <p className="text-gray-500 text-sm italic">
                            Sin observaciones registradas
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Creación
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-gray-900 text-sm">
                          {new Date(
                            viewingItinerario.createdAt
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS styles para animaciones
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}
`;

// Inyectar estilos
(() => {
  const style = document.createElement("style");
  style.textContent = styles;
  document.head.appendChild(style);
})();

export default GestionItinerarios;
