"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import toast from "../../utils/toast";
import {
  BarChart3,
  PieChart,
  FileText,
  Download,
  Calendar,
  Filter,
} from "lucide-react";

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

const Reportes = () => {
  const { user, permisos } = useAuth();
  const [reporteReservas, setReporteReservas] = useState([]);
  const [reporteRecursos, setReporteRecursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Verificar permisos
  const puedeVerReporteReservas = user?.permisos?.includes("ver_reporte_reservas");
  const puedeVerReporteRecursos = user?.permisos?.includes("ver_reporte_recursos");
  

  useEffect(() => {
    if (puedeVerReporteReservas || puedeVerReporteRecursos) {
      cargarReportes();
    }
  }, [puedeVerReporteReservas, puedeVerReporteRecursos]);

  const cargarReportes = async () => {
    if (!puedeVerReporteReservas && !puedeVerReporteRecursos) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const promises = [];

      if (puedeVerReporteReservas) {
        promises.push(
          axios
            .get(`${API_BASE_URL}/reportes/reservas-por-actividad`)
            .then((response) => ({ tipo: "reservas", data: response.data }))
            .catch((err) => ({
              tipo: "reservas",
              error: err.response?.data?.error || err.message,
            }))
        );
      }

      if (puedeVerReporteRecursos) {
        promises.push(
          axios
            .get(`${API_BASE_URL}/reportes/estado-recursos`)
            .then((response) => ({ tipo: "recursos", data: response.data }))
            .catch((err) => ({
              tipo: "recursos",
              error: err.response?.data?.error || err.message,
            }))
        );
      }

      if (promises.length > 0) {
        const resultados = await Promise.all(promises);

        resultados.forEach((resultado) => {
          if (resultado.tipo === "reservas") {
            if (resultado.error) {
              setError(
                (prev) =>
                  prev + `Error en reporte de reservas: ${resultado.error}. `
              );
            } else {
              setReporteReservas(resultado.data || []);
            }
          } else if (resultado.tipo === "recursos") {
            if (resultado.error) {
              setError(
                (prev) =>
                  prev + `Error en reporte de recursos: ${resultado.error}. `
              );
            } else {
              setReporteRecursos(resultado.data || []);
            }
          }
        });
      }
    } catch (err) {
      setError(
        "Error general al cargar reportes: " +
          (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltro = (e) => {
    e.preventDefault();
    // Aquí podrías agregar parámetros de fecha a las APIs si el backend los soporta
    cargarReportes();
  };

  const exportarPDF = () => {
    toast.info("Exportar a PDF (funcionalidad a implementar)");
  };

  const exportarExcel = () => {
    toast.info("Exportar a Excel (funcionalidad a implementar)");
  };

  const calcularTotalReservas = () => {
    return reporteReservas.reduce((total, item) => total + item.total, 0);
  };

  const calcularTotalRecursos = () => {
    return reporteRecursos.reduce((total, item) => total + item.total, 0);
  };

  const getColorEstado = (estado) => {
    switch (estado) {
      case "Libre":
        return "bg-green-500";
      case "Ocupado":
        return "bg-yellow-500";
      case "Mantenimiento":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getIconoEstado = (estado) => {
    switch (estado) {
      case "Libre":
        return "✅";
      case "Ocupado":
        return "⚠️";
      case "Mantenimiento":
        return "🔧";
      default:
        return "❓";
    }
  };

  if (!puedeVerReporteReservas && !puedeVerReporteRecursos) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-md">
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Sin Acceso a Reportes
          </h3>
          <p className="text-gray-500">
            No tienes permisos para ver ningún reporte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Generación de Reportes
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <button
            onClick={exportarPDF}
            className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span> PDF
          </button>
          <button
            onClick={exportarExcel}
            className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span> Excel
          </button>
        </div>
      </div>

      {/* Filtros */}
      <form
        onSubmit={aplicarFiltro}
        className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg"
      >
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
          >
            <Filter className="w-4 h-4" />
            {loading ? "Cargando..." : "Aplicar Filtro"}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Reportes */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Reporte de Reservas por Actividad */}
        {puedeVerReporteReservas && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                Reservas por Actividad
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Cargando reporte...</p>
              </div>
            ) : reporteReservas.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600">
                  No hay datos de reservas disponibles
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 p-2 sm:p-3 bg-blue-100 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-800">
                    <strong>Actividades:</strong> {reporteReservas.length} |{" "}
                    <strong>Reservas:</strong> {calcularTotalReservas()}
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {reporteReservas.map((item, index) => {
                    const maxReservas = Math.max(
                      ...reporteReservas.map((r) => r.total)
                    );
                    const porcentaje = (item.total / maxReservas) * 100;

                    return (
                      <div
                        key={index}
                        className="bg-white p-2 sm:p-3 rounded-lg border"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-800 text-sm sm:text-base truncate mr-2">
                            {item.nombreActividad || "Actividad sin nombre"}
                          </span>
                          <span className="text-blue-600 font-bold text-sm sm:text-base flex-shrink-0">
                            {item.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${porcentaje}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Reporte de Estado de Recursos */}
        {puedeVerReporteRecursos && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <div className="flex items-center mb-4">
              <PieChart className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">
                Estado de Recursos
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Cargando reporte...</p>
              </div>
            ) : reporteRecursos.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600">
                  No hay datos de recursos disponibles
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 p-3 bg-green-100 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Total de Recursos:</strong>{" "}
                    {calcularTotalRecursos()}
                  </p>
                </div>

                <div className="space-y-3">
                  {reporteRecursos.map((item, index) => {
                    const totalRecursos = calcularTotalRecursos();
                    const porcentaje =
                      totalRecursos > 0
                        ? (item.total / totalRecursos) * 100
                        : 0;

                    return (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">
                              {getIconoEstado(item._id)}
                            </span>
                            <span className="font-medium text-gray-800">
                              {item._id}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-800">
                              {item.total}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({porcentaje.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${getColorEstado(
                              item._id
                            )}`}
                            style={{ width: `${porcentaje}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reportes;
