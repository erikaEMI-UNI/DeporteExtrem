"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../../hooks/useAuth"
import toast from "../../utils/toast"

// Configuración de axios
const API_BASE_URL = "/api";

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/* ================= ICONOS ================= */
const AlertTriangle = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4m0 4h.01" />
  </svg>
);

const Download = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const Search = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const Eye = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const X = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m18 6-12 12m0-12 12 12" />
  </svg>
);

const Clock = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const User = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const Filter = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export default function BitacoraConPermisos() {
  const { user } = useAuth()
  const [bitacora, setBitacora] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState("")
  const [filtroFecha, setFiltroFecha] = useState("")
  const [filtroBusqueda, setFiltroBusqueda] = useState("")
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingRecord, setViewingRecord] = useState(null)

  // Verificación de permisos
  const puedeListarBitacora = user?.permisos?.includes("ver_historial")
  const puedeVerDetalleBitacora = user?.permisos?.includes("ver_detalle_historial")
  const puedeExportarBitacora = user?.permisos?.includes("exportar_historial")

  const token = localStorage.getItem("authToken") || user?.token

  useEffect(() => {
    if (puedeListarBitacora && token) {
      cargarBitacora()
    }
  }, [puedeListarBitacora, token])

  const cargarBitacora = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/historial`)
      setBitacora(response.data)
    } catch (error) {
      console.error("Error cargando bitácora:", error)
      toast.error("Error al cargar la bitácora")
    } finally {
      setLoading(false)
    }
  }

  const verRegistroPorId = async (id) => {
    if (!puedeVerDetalleBitacora) {
      toast.error("No tienes permisos para ver detalles de registros de bitácora")
      return
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/historial/${id}`)
      setViewingRecord(response.data)
      setIsViewModalOpen(true)
    } catch (error) {
      console.error("Error obteniendo registro:", error)
      toast.error(error.response?.data?.error || "Error al obtener los detalles del registro")
    }
  }

  const exportarBitacora = async () => {
    if (!puedeExportarBitacora) {
      toast.error("No tienes permisos para exportar la bitácora")
      return
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/historial/export`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `bitacora_${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exportando bitácora:", error)
      toast.error("Error al exportar la bitácora")
    }
  }

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleString("es-BO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTipoAccion = (accion) => {
    if (accion.includes("Inició sesión")) return "Sesión"
    if (accion.includes("Creó")) return "Creación"
    if (accion.includes("Actualizó") || accion.includes("Editó")) return "Modificación"
    if (accion.includes("Eliminó")) return "Eliminación"
    if (accion.includes("Activó") || accion.includes("Desactivó")) return "Estado"
    return "Otro"
  }

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case "Sesión":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Creación":
        return "bg-green-100 text-green-700 border-green-200"
      case "Modificación":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "Eliminación":
        return "bg-red-100 text-red-700 border-red-200"
      case "Estado":
        return "bg-purple-100 text-purple-700 border-purple-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const bitacoraFiltrada = bitacora.filter((registro) => {
    if (filtroTipo && getTipoAccion(registro.accion) !== filtroTipo) return false
    if (filtroFecha) {
      const fechaRegistro = new Date(registro.fecha).toISOString().split("T")[0]
      if (fechaRegistro !== filtroFecha) return false
    }
    if (filtroBusqueda) {
      const busqueda = filtroBusqueda.toLowerCase()
      const nombreUsuario = registro.usuario?.nombre?.toLowerCase() || ""
      const emailUsuario = registro.usuario?.email?.toLowerCase() || ""
      const accion = registro.accion?.toLowerCase() || ""
      if (!nombreUsuario.includes(busqueda) && !emailUsuario.includes(busqueda) && !accion.includes(busqueda)) {
        return false
      }
    }
    return true
  })

  if (!puedeListarBitacora) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md border border-orange-200">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-orange-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Sin Permisos</h3>
          <p className="text-gray-600 text-center">
            No tienes los permisos necesarios para ver la bitácora. Contacta a un administrador.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Cargando bitácora...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-2">
                📋 Bitácora de Actividades
              </h1>
              <p className="text-gray-600">Registro completo de acciones del sistema</p>
            </div>
            {puedeExportarBitacora && (
              <button
                onClick={exportarBitacora}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download size={20} />
                Exportar CSV
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-red-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por usuario o acción..."
                value={filtroBusqueda}
                onChange={(e) => setFiltroBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Tipo */}
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Todos los tipos</option>
              <option value="Sesión">Sesión</option>
              <option value="Creación">Creación</option>
              <option value="Modificación">Modificación</option>
              <option value="Eliminación">Eliminación</option>
              <option value="Estado">Estado</option>
              <option value="Otro">Otro</option>
            </select>

            {/* Fecha */}
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Botón limpiar */}
          {(filtroTipo || filtroFecha || filtroBusqueda) && (
            <button
              onClick={() => {
                setFiltroTipo("")
                setFiltroFecha("")
                setFiltroBusqueda("")
              }}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Contador */}
        <div className="bg-white rounded-xl shadow-md border border-red-100 px-4 py-3 mb-6">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-bold text-red-600">{bitacoraFiltrada.length}</span> de{" "}
            <span className="font-bold text-gray-900">{bitacora.length}</span> registros
          </p>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Usuario</th>
                  <th className="px-6 py-4 text-left font-semibold">Acción</th>
                  <th className="px-6 py-4 text-left font-semibold">Tipo</th>
                  <th className="px-6 py-4 text-left font-semibold">Fecha y Hora</th>
                  {puedeVerDetalleBitacora && <th className="px-6 py-4 text-left font-semibold">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {bitacoraFiltrada.length === 0 ? (
                  <tr>
                    <td colSpan={puedeVerDetalleBitacora ? "5" : "4"} className="px-6 py-12 text-center text-gray-500">
                      <Search className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-lg font-medium">No hay registros que coincidan con los filtros</p>
                    </td>
                  </tr>
                ) : (
                  bitacoraFiltrada.map((registro) => (
                    <tr key={registro._id} className="border-t border-gray-100 hover:bg-red-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center">
                            <User className="text-white" size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{registro.usuario?.nombre || "Usuario desconocido"}</p>
                            <p className="text-sm text-gray-500">{registro.usuario?.email || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700 max-w-xs truncate" title={registro.accion}>
                          {registro.accion}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getTipoColor(getTipoAccion(registro.accion))}`}>
                          {getTipoAccion(registro.accion)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock size={16} className="text-gray-400" />
                          <span className="text-sm">{formatearFecha(registro.fecha)}</span>
                        </div>
                      </td>
                      {puedeVerDetalleBitacora && (
                        <td className="px-6 py-4">
                          <button
                            onClick={() => verRegistroPorId(registro._id)}
                            className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Ver Detalles */}
      {isViewModalOpen && viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-white">Detalles del Registro</h3>
                <p className="text-gray-300 text-sm">ID: {viewingRecord._id}</p>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna Izquierda */}
                <div className="space-y-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Usuario</label>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center">
                        <User className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{viewingRecord.usuario?.nombre || "Usuario desconocido"}</p>
                        <p className="text-sm text-gray-600">{viewingRecord.usuario?.email || ""}</p>
                        {viewingRecord.usuario?.rol && (
                          <p className="text-xs text-gray-500">Rol: {viewingRecord.usuario.rol}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Tipo de Acción</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getTipoColor(getTipoAccion(viewingRecord.accion))}`}>
                      {getTipoAccion(viewingRecord.accion)}
                    </span>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Fecha y Hora</label>
                    <div className="space-y-1">
                      <p className="text-gray-900 font-medium">{formatearFecha(viewingRecord.fecha)}</p>
                      <p className="text-xs text-gray-500 font-mono">UTC: {new Date(viewingRecord.fecha).toISOString()}</p>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Descripción</label>
                    <div className="bg-blue-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                      <p className="text-gray-900 whitespace-pre-wrap">{viewingRecord.accion}</p>
                    </div>
                  </div>

                  {viewingRecord.ip && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                      <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">IP</label>
                      <p className="text-gray-900 font-mono">{viewingRecord.ip}</p>
                    </div>
                  )}

                  {viewingRecord.detalles && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                      <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Detalles</label>
                      <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {typeof viewingRecord.detalles === "object"
                            ? JSON.stringify(viewingRecord.detalles, null, 2)
                            : viewingRecord.detalles}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end shrink-0">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}