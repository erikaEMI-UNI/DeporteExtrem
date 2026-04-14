"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../../../hooks/useAuth"
import { ClipboardList, FileText, Download, Eye, Upload, X, Heart, User, Calendar, AlertCircle } from "lucide-react"
import toast from "../../../utils/toast"

// Configuración de axios
const API_BASE_URL = "/api"

// Configurar interceptor para incluir token en todas las peticiones
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

const TablaControl = () => {
  const { user } = useAuth()
  const [fichasMedicas, setFichasMedicas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingFicha, setEditingFicha] = useState(null)
  const [viewingFicha, setViewingFicha] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [usuarioActualId, setUsuarioActualId] = useState(null)
  const [newFicha, setNewFicha] = useState({
    usuario: "",
    grupoSanguineo: "",
    alergias: [],
    enfermedades: [],
    medicamentos: [],
    archivoPdf: null,
    telefonoRespaldo: "",
  })

  // Verificación de permisos
  const puedeCrear = user?.permisos?.includes("crear_ficha_medica")
  const puedeVer = user?.permisos?.includes("ver_ficha_medica")
  const puedeEditar = user?.permisos?.includes("editar_ficha_medica")
  const puedeEliminar = user?.permisos?.includes("eliminar_ficha_medica")
  const puedeVerUsuarios = user?.permisos?.includes("ver_usuarios")

  const puedeAccionar = ["ver_ficha_medica", "editar_ficha_medica", "eliminar_ficha_medica"].some((p) =>
    user?.permisos?.includes(p),
  )

  const token = localStorage.getItem("authToken") || user?.token

  const gruposSanguineos = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  // ✅ NUEVO: Un solo useEffect que hace todo
useEffect(() => {
  const inicializar = async () => {
    if (!token) return

    try {
      setLoading(true)

      // 1. Obtener usuario actual
      const userResponse = await axios.get(`${API_BASE_URL}/auth/me`)
      console.log('✅ Usuario actual:', userResponse.data)
      setUsuarioActualId(userResponse.data.id)

      // 2. Cargar datos según rol
      const esAdmin = user?.roles?.includes("admin")
      const esOperador = user?.roles?.includes("operador")
      const esTurista = !esAdmin && !esOperador
      const puedeVerTodosLosUsuarios = esAdmin || esOperador

      if (esTurista) {
        // Turista: cargar solo su ficha
        const usuarioActual = userResponse.data
        setUsuarios([usuarioActual])

        try {
          const fichaResponse = await axios.get(`${API_BASE_URL}/fichas-medicas/${userResponse.data.id}`)
          const fichaConUsuario = { ...fichaResponse.data, usuarioInfo: usuarioActual }
          setFichasMedicas([fichaConUsuario])
        } catch (error) {
          if (error.response?.status === 404) {
            setFichasMedicas([])
          } else {
            throw error
          }
        }
      } else if (puedeVerTodosLosUsuarios && puedeVerUsuarios) {
        // Admin/Operador: cargar usuarios (para dropdown) + todas las fichas (incluyendo de reservas)
        const [usuariosResponse, fichasResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/usuarios`),
          axios.get(`${API_BASE_URL}/fichas-medicas`),
        ])
        setUsuarios(usuariosResponse.data)
        // El backend devuelve usuario populado; normalizamos para que usuario sea siempre el _id string
        const fichas = fichasResponse.data.map(f => ({
          ...f,
          usuarioInfo: typeof f.usuario === 'object' ? f.usuario : null,
          usuario:     typeof f.usuario === 'object' ? f.usuario._id : f.usuario,
        }))
        setFichasMedicas(fichas)
      }
    } catch (error) {
      console.error("Error inicializando:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  inicializar()
}, [token, user]) // Dependencias: token y user

  // const cargarDatos = async () => {
  //   try {
  //     setLoading(true)

  //     const esAdmin = user?.roles?.includes("admin")
  //     const esOperador = user?.roles?.includes("operador")
  //     const esTurista = !esAdmin && !esOperador
  //     const puedeVerTodosLosUsuarios = esAdmin || esOperador

  //     if (esTurista) {
  //       await cargarFichaPropiaUsuario()
  //     } else if (puedeVerTodosLosUsuarios && puedeVerUsuarios) {
  //       const response = await axios.get(`${API_BASE_URL}/usuarios`)
  //       setUsuarios(response.data)
  //       await cargarFichasMedicas(response.data)
  //     }
  //   } catch (error) {
  //     console.error("Error cargando datos:", error)
  //     alert("Error al cargar los datos")
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // const cargarFichaPropiaUsuario = async () => {
  //   if (!puedeVer || !usuarioActualId) return

  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/auth/me`)
  //     const usuarioActual = response.data
  //     setUsuarios([usuarioActual])

  //     try {
  //       const fichaResponse = await axios.get(`${API_BASE_URL}/fichas-medicas/${usuarioActualId}`)
  //       const fichaConUsuario = { ...fichaResponse.data, usuarioInfo: usuarioActual }
  //       setFichasMedicas([fichaConUsuario])
  //     } catch (error) {
  //       if (error.response?.status === 404) {
  //         setFichasMedicas([])
  //       } else {
  //         throw error
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error cargando ficha propia:", error)
  //     setFichasMedicas([])
  //   }
  // }

  // const cargarFichasMedicas = async (usuariosList) => {
  //   if (!puedeVer) return

  //   try {
  //     const fichasPromises = usuariosList.map(async (usuario) => {
  //       try {
  //         const response = await axios.get(`${API_BASE_URL}/fichas-medicas/${usuario._id}`)
  //         return { ...response.data, usuarioInfo: usuario }
  //       } catch (error) {
  //         if (error.response?.status === 404) {
  //           return null
  //         }
  //         throw error
  //       }
  //     })

  //     const fichasResults = await Promise.all(fichasPromises)
  //     const fichasExistentes = fichasResults.filter((ficha) => ficha !== null)
  //     setFichasMedicas(fichasExistentes)
  //   } catch (error) {
  //     console.error("Error cargando fichas médicas:", error)
  //   }
  // }

  const crearFicha = async () => {
    if (!puedeCrear) {
      toast.error("No tienes permisos para crear fichas médicas")
      return
    }

    if (!newFicha.usuario ||
        newFicha.usuario === "" ||
        newFicha.usuario === "undefined" ||
        !/^[0-9a-fA-F]{24}$/.test(newFicha.usuario)) {
      console.error("❌ Usuario inválido:", newFicha.usuario)
      toast.error("Error: Usuario inválido. Por favor, selecciona un usuario válido.")
      return
    }

    try {
      console.log("📤 Enviando ficha médica para usuario:", newFicha.usuario)

      const formData = new FormData()
      formData.append("usuario", newFicha.usuario)
      formData.append("grupoSanguineo", newFicha.grupoSanguineo || "")
      formData.append("telefonoRespaldo", newFicha.telefonoRespaldo || "")
      formData.append("alergias", JSON.stringify(newFicha.alergias))
      formData.append("enfermedades", JSON.stringify(newFicha.enfermedades))
      formData.append("medicamentos", JSON.stringify(newFicha.medicamentos))

      if (selectedFile) {
        formData.append("archivoPdf", selectedFile)
      }

      const response = await axios.post(`${API_BASE_URL}/fichas-medicas`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const usuarioInfo = usuarios.find((u) => u._id === newFicha.usuario)
      const nuevaFicha = { ...response.data, usuarioInfo }

      setFichasMedicas([...fichasMedicas, nuevaFicha])
      setIsCreateModalOpen(false)
      resetNewFicha()
      toast.success("✅ Ficha médica creada correctamente")
    } catch (error) {
      console.error("❌ Error creando ficha médica:", error)
      console.error("- Response data:", error.response?.data)
      toast.error(error.response?.data?.error || error.response?.data?.msg || "Error al crear ficha médica")
    }
  }

  const editarFicha = async () => {
    if (!puedeEditar) {
      toast.error("No tienes permisos para editar fichas médicas")
      return
    }

    if (!editingFicha) return

    try {
      const formData = new FormData()
      formData.append("grupoSanguineo", editingFicha.grupoSanguineo || "")
      formData.append("telefonoRespaldo", editingFicha.telefonoRespaldo || "")
      formData.append("alergias", JSON.stringify(editingFicha.alergias))
      formData.append("enfermedades", JSON.stringify(editingFicha.enfermedades))
      formData.append("medicamentos", JSON.stringify(editingFicha.medicamentos))

      if (selectedFile) {
        formData.append("archivoPdf", selectedFile)
      }

      const response = await axios.put(`${API_BASE_URL}/fichas-medicas/${editingFicha.usuario}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setFichasMedicas(
        fichasMedicas.map((f) =>
          f._id === editingFicha._id
            ? { ...response.data, usuarioInfo: f.usuarioInfo, usuario: typeof response.data.usuario === 'object' ? response.data.usuario._id : response.data.usuario }
            : f,
        ),
      )
      setIsEditModalOpen(false)
      setEditingFicha(null)
      setSelectedFile(null)
      toast.success("✅ Ficha médica actualizada correctamente")
    } catch (error) {
      console.error("Error editando ficha médica:", error)
      toast.error(error.response?.data?.error || "Error al editar ficha médica")
    }
  }

  const eliminarFicha = async (ficha) => {
    if (!puedeEliminar) {
      toast.error("No tienes permisos para eliminar fichas médicas")
      return
    }

    if (!confirm(`¿Estás seguro de eliminar la ficha médica de ${ficha.usuarioInfo?.nombre}?`)) {
      return
    }

    try {
      await axios.delete(`${API_BASE_URL}/fichas-medicas/id/${ficha._id}`)
      setFichasMedicas(fichasMedicas.filter((f) => f._id !== ficha._id))
      toast.success("✅ Ficha médica eliminada correctamente")
    } catch (error) {
      console.error("Error eliminando ficha médica:", error)
      toast.error(error.response?.data?.error || "Error al eliminar ficha médica")
    }
  }

  const descargarPdf = async (ficha) => {
    if (!puedeVer) {
      toast.error("No tienes permisos para descargar archivos")
      return
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/fichas-medicas/${ficha.usuario}/descargar`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `ficha_medica_${ficha.usuarioInfo?.nombre || "usuario"}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error descargando PDF:", error)
      toast.error("Error al descargar el archivo PDF")
    }
  }

  const verPdf = async (ficha) => {
    if (!puedeVer) {
      toast.error("No tienes permisos para ver archivos")
      return
    }

    try {
      const url = `${API_BASE_URL}/fichas-medicas/${ficha.usuario}/ver-pdf`
      window.open(url, "_blank")
    } catch (error) {
      console.error("Error abriendo PDF:", error)
      toast.error("Error al abrir el archivo PDF")
    }
  }

  const resetNewFicha = () => {
    setNewFicha({
      usuario: "",
      grupoSanguineo: "",
      alergias: [],
      enfermedades: [],
      medicamentos: [],
      archivoPdf: null,
      telefonoRespaldo: "",
    })
    setSelectedFile(null)
  }

  const abrirCrearFicha = () => {
    if (!puedeCrear) {
      toast.error("No tienes permisos para crear fichas médicas")
      return
    }

    const esTurista = !user?.roles?.includes("admin") && !user?.roles?.includes("operador")

    if (esTurista && !usuarioActualId) {
      console.error("❌ usuarioActualId no está definido")
      toast.error("Error: No se pudo identificar tu usuario. Por favor, recarga la página.")
      return
    }

    const usuarioPreseleccionado = esTurista ? usuarioActualId : ""

    console.log("✅ Abriendo modal con usuario:", usuarioPreseleccionado)

    setNewFicha({
      usuario: usuarioPreseleccionado,
      grupoSanguineo: "",
      alergias: [],
      enfermedades: [],
      medicamentos: [],
      archivoPdf: null,
      telefonoRespaldo: "",
    })
    setSelectedFile(null)
    setIsCreateModalOpen(true)
  }

  const abrirEditarFicha = (ficha) => {
    if (!puedeEditar) {
      toast.error("No tienes permisos para editar fichas médicas")
      return
    }
    setEditingFicha({ ...ficha })
    setSelectedFile(null)
    setIsEditModalOpen(true)
  }

  const abrirVerFicha = (ficha) => {
    if (!puedeVer) {
      toast.error("No tienes permisos para ver fichas médicas")
      return
    }
    setViewingFicha(ficha)
    setIsViewModalOpen(true)
  }

  const handleArrayChange = (field, value, isEditing = false) => {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "")

    if (isEditing) {
      setEditingFicha({
        ...editingFicha,
        [field]: items,
      })
    } else {
      setNewFicha({
        ...newFicha,
        [field]: items,
      })
    }
  }

  const fichasFiltradas = fichasMedicas.filter(
    (ficha) =>
      (ficha.usuarioInfo?.nombre || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (ficha.usuarioInfo?.email || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (ficha.nombreParticipante || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (ficha.telefonoRespaldo || '').toLowerCase().includes(filtro.toLowerCase()),
  )

  // Todos los usuarios disponibles para crear fichas (se permiten múltiples por usuario)
  const usuariosSinFicha = usuarios

  if (!puedeVer && !puedeCrear) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-orange-500">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Acceso Restringido</h3>
                <p className="text-gray-600">
                  No tienes los permisos necesarios para gestionar fichas médicas. Contacta a un administrador.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4"></div>
              <p className="text-lg text-gray-700 font-medium">Cargando fichas médicas...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-4 rounded-xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {!user?.roles?.includes("admin") && !user?.roles?.includes("operador")
                    ? "Mi Ficha Médica"
                    : "Gestión de Fichas Médicas"}
                </h1>
                <p className="text-red-100">
                  {!user?.roles?.includes("admin") && !user?.roles?.includes("operador")
                    ? "Información de salud personal"
                    : "Control y administración de registros médicos"}
                </p>
              </div>
            </div>
            {puedeCrear && (
              <button
                onClick={abrirCrearFicha}
                className="bg-white text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                + Nueva Ficha
              </button>
            )}
          </div>
        </div>

        {/* Search Card */}
        {puedeVer && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder={
                  !user?.roles?.includes("admin") && !user?.roles?.includes("operador")
                    ? "Buscar en mi ficha médica..."
                    : "Buscar por nombre, email o grupo sanguíneo..."
                }
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Usuario</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nombre Participante</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Alergias</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Archivo PDF</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Medicamentos</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tel. Respaldo</th>
                  {puedeAccionar && <th className="px-6 py-4 text-left text-sm font-semibold">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fichasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={puedeAccionar ? "8" : "7"} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No hay fichas médicas que coincidan con el filtro</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  fichasFiltradas.map((ficha) => (
                    <tr key={ficha._id} className="hover:bg-orange-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-red-500 to-orange-500 p-2 rounded-lg">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-semibold text-gray-800">{ficha.usuarioInfo?.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{ficha.usuarioInfo?.email}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {ficha.nombreParticipante || <span className="italic text-gray-400">—</span>}
                          </p>
                          {ficha.reservaId && (
                            <span className="text-xs text-blue-500 font-medium">Desde reserva</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {ficha.alergias && ficha.alergias.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {ficha.alergias.slice(0, 2).map((alergia, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-medium"
                                >
                                  {alergia}
                                </span>
                              ))}
                              {ficha.alergias.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                                  +{ficha.alergias.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Sin alergias</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {ficha.archivoPdf ? (
                          <div className="flex gap-2">
                            {puedeVer && (
                              <>
                                <button
                                  onClick={() => verPdf(ficha)}
                                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                  title="Ver PDF"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => descargarPdf(ficha)}
                                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                  title="Descargar PDF"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Sin archivo</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {ficha.medicamentos && ficha.medicamentos.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {ficha.medicamentos.slice(0, 2).map((med, idx) => (
                                <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-medium">{med}</span>
                              ))}
                              {ficha.medicamentos.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">+{ficha.medicamentos.length - 2}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Sin medicamentos</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {ficha.telefonoRespaldo || <span className="text-xs text-gray-400 italic">—</span>}
                        </span>
                      </td>
                      {puedeAccionar && (
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {puedeVer && (
                              <button
                                onClick={() => abrirVerFicha(ficha)}
                                className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs font-medium transition-colors"
                              >
                                Ver
                              </button>
                            )}
                            {puedeEditar && (
                              <button
                                onClick={() => abrirEditarFicha(ficha)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium transition-colors"
                              >
                                Editar
                              </button>
                            )}
                            {puedeEliminar && (
                              <button
                                onClick={() => eliminarFicha(ficha)}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium transition-colors"
                              >
                                Eliminar
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
        </div>
      </div>

      {/* Modal Crear Ficha */}
      {isCreateModalOpen && puedeCrear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-8 py-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Crear Nueva Ficha Médica</h3>
                    <p className="text-green-100 text-sm">Complete la información médica del usuario</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)] bg-gradient-to-br from-gray-50 to-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-100">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">Información Básica</h4>
                      <p className="text-gray-600 text-sm">Datos del usuario</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Usuario *</label>
                      {!user?.roles?.includes("admin") && !user?.roles?.includes("operador") ? (
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-blue-200 rounded-xl px-4 py-3">
                          <p className="text-gray-900 font-medium">{user?.nombre}</p>
                          <p className="text-gray-600 text-sm">{user?.email}</p>
                        </div>
                      ) : (
                        <select
                          className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          value={newFicha.usuario}
                          onChange={(e) => setNewFicha({ ...newFicha, usuario: e.target.value })}
                        >
                          <option value="">Seleccionar usuario</option>
                          {usuariosSinFicha.map((usuario) => (
                            <option key={usuario._id} value={usuario._id}>
                              {usuario.nombre} - {usuario.email}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Grupo Sanguíneo</label>
                      <select
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        value={newFicha.grupoSanguineo}
                        onChange={(e) => setNewFicha({ ...newFicha, grupoSanguineo: e.target.value })}
                      >
                        <option value="">— No especificado —</option>
                        {gruposSanguineos.map((grupo) => (
                          <option key={grupo} value={grupo}>
                            {grupo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Número Telefónico de Respaldo</label>
                      <input
                        type="tel"
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        value={newFicha.telefonoRespaldo}
                        onChange={(e) => setNewFicha({ ...newFicha, telefonoRespaldo: e.target.value })}
                        placeholder="Ej: 70012345"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Archivo PDF</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                          className="hidden"
                          id="pdf-upload"
                        />
                        <label htmlFor="pdf-upload" className="cursor-pointer">
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600 font-medium">
                            {selectedFile ? selectedFile.name : "Haz clic para subir un archivo PDF"}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">Máximo 10MB</p>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-100">
                    <div className="bg-red-100 p-3 rounded-xl">
                      <Heart className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">Información Médica</h4>
                      <p className="text-gray-600 text-sm">Datos de salud</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Alergias</label>
                      <textarea
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                        rows="3"
                        value={newFicha.alergias.join(", ")}
                        onChange={(e) => handleArrayChange("alergias", e.target.value)}
                        placeholder="Separar con comas (ej: Polen, Mariscos, Penicilina)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Enfermedades</label>
                      <textarea
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                        rows="3"
                        value={newFicha.enfermedades.join(", ")}
                        onChange={(e) => handleArrayChange("enfermedades", e.target.value)}
                        placeholder="Separar con comas (ej: Diabetes, Hipertensión)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Medicamentos</label>
                      <textarea
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                        rows="3"
                        value={newFicha.medicamentos.join(", ")}
                        onChange={(e) => handleArrayChange("medicamentos", e.target.value)}
                        placeholder="Separar con comas (ej: Metformina, Losartán)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 bg-gray-50 border-t-2 border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Campos obligatorios:</span> Usuario, Grupo Sanguíneo
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={crearFicha}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all shadow-lg font-medium"
                >
                  Crear Ficha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {isEditModalOpen && editingFicha && puedeEditar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Editar Ficha Médica</h3>
                    <p className="text-blue-100 text-sm">Modificar información de {editingFicha.usuarioInfo?.nombre}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)] bg-gradient-to-br from-gray-50 to-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-100">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">Información Básica</h4>
                      <p className="text-gray-600 text-sm">Datos del usuario</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Usuario</label>
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-blue-200 rounded-xl px-4 py-3">
                        <p className="text-gray-900 font-medium">{editingFicha.usuarioInfo?.nombre}</p>
                        <p className="text-gray-600 text-sm">{editingFicha.usuarioInfo?.email}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Grupo Sanguíneo</label>
                      <select
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={editingFicha.grupoSanguineo || ""}
                        onChange={(e) => setEditingFicha({ ...editingFicha, grupoSanguineo: e.target.value })}
                      >
                        <option value="">— No especificado —</option>
                        {gruposSanguineos.map((grupo) => (
                          <option key={grupo} value={grupo}>
                            {grupo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Número Telefónico de Respaldo</label>
                      <input
                        type="tel"
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={editingFicha.telefonoRespaldo || ""}
                        onChange={(e) => setEditingFicha({ ...editingFicha, telefonoRespaldo: e.target.value })}
                        placeholder="Ej: 70012345"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Archivo PDF</label>
                      {editingFicha.archivoPdf && (
                        <div className="mb-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
                          <p className="text-sm text-blue-800 font-medium mb-2">Archivo actual disponible</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => verPdf(editingFicha)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Ver archivo
                            </button>
                            <span className="text-gray-400">|</span>
                            <button
                              onClick={() => descargarPdf(editingFicha)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Descargar
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                          className="hidden"
                          id="pdf-upload-edit"
                        />
                        <label htmlFor="pdf-upload-edit" className="cursor-pointer">
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600 font-medium">
                            {selectedFile ? selectedFile.name : "Haz clic para cambiar el archivo PDF"}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">Máximo 10MB</p>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-100">
                    <div className="bg-red-100 p-3 rounded-xl">
                      <Heart className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">Información Médica</h4>
                      <p className="text-gray-600 text-sm">Datos de salud</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Alergias</label>
                      <textarea
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        rows="3"
                        value={editingFicha.alergias?.join(", ") || ""}
                        onChange={(e) => handleArrayChange("alergias", e.target.value, true)}
                        placeholder="Separar con comas (ej: Polen, Mariscos, Penicilina)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Enfermedades</label>
                      <textarea
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        rows="3"
                        value={editingFicha.enfermedades?.join(", ") || ""}
                        onChange={(e) => handleArrayChange("enfermedades", e.target.value, true)}
                        placeholder="Separar con comas (ej: Diabetes, Hipertensión)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Medicamentos</label>
                      <textarea
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        rows="3"
                        value={editingFicha.medicamentos?.join(", ") || ""}
                        onChange={(e) => handleArrayChange("medicamentos", e.target.value, true)}
                        placeholder="Separar con comas (ej: Metformina, Losartán)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 bg-gray-50 border-t-2 border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Editando:</span> {editingFicha.usuarioInfo?.nombre}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={editarFicha}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-medium"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver */}
      {isViewModalOpen && viewingFicha && puedeVer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp">
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-8 py-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                    <Eye className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Detalles de Ficha Médica</h3>
                    <p className="text-gray-300 text-sm">Información completa de {viewingFicha.usuarioInfo?.nombre}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)] bg-gradient-to-br from-gray-50 to-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-100">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">Información del Usuario</h4>
                      <p className="text-gray-600 text-sm">Datos personales</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
                      <div className="bg-gray-50 p-3 rounded-xl border-2 border-gray-200">
                        <p className="text-gray-900 font-medium">{viewingFicha.usuarioInfo?.nombre}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <div className="bg-gray-50 p-3 rounded-xl border-2 border-gray-200">
                        <p className="text-gray-900">{viewingFicha.usuarioInfo?.email}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Grupo Sanguíneo</label>
                      <div className="bg-gray-50 p-3 rounded-xl border-2 border-gray-200">
                        <span className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-sm font-bold shadow-md">
                          {viewingFicha.grupoSanguineo}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Creación</label>
                      <div className="bg-gray-50 p-3 rounded-xl border-2 border-gray-200">
                        <div className="flex items-center gap-2 text-gray-900">
                          <Calendar className="w-4 h-4" />
                          <p className="text-sm">{new Date(viewingFicha.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-100">
                    <div className="bg-red-100 p-3 rounded-xl">
                      <Heart className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">Información Médica</h4>
                      <p className="text-gray-600 text-sm">Datos de salud</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Alergias</label>
                      <div className="bg-gray-50 p-3 rounded-xl border-2 border-gray-200 max-h-24 overflow-y-auto">
                        {viewingFicha.alergias && viewingFicha.alergias.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {viewingFicha.alergias.map((alergia, index) => (
                              <span
                                key={index}
                                className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-medium"
                              >
                                {alergia}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm italic">Sin alergias registradas</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Enfermedades</label>
                      <div className="bg-gray-50 p-3 rounded-xl border-2 border-gray-200 max-h-24 overflow-y-auto">
                        {viewingFicha.enfermedades && viewingFicha.enfermedades.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {viewingFicha.enfermedades.map((enfermedad, index) => (
                              <span
                                key={index}
                                className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-xs font-medium"
                              >
                                {enfermedad}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm italic">Sin enfermedades registradas</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Medicamentos</label>
                      <div className="bg-gray-50 p-3 rounded-xl border-2 border-gray-200 max-h-24 overflow-y-auto">
                        {viewingFicha.medicamentos && viewingFicha.medicamentos.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {viewingFicha.medicamentos.map((medicamento, index) => (
                              <span
                                key={index}
                                className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-medium"
                              >
                                {medicamento}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm italic">Sin medicamentos registrados</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Archivo PDF</label>
                      <div className="bg-gray-50 p-3 rounded-xl border-2 border-gray-200">
                        {viewingFicha.archivoPdf ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <p className="text-sm text-gray-900 font-medium">Archivo disponible</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => verPdf(viewingFicha)}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Ver PDF"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => descargarPdf(viewingFicha)}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                title="Descargar PDF"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm italic">Sin archivo PDF</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 bg-gray-50 border-t-2 border-gray-200 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = `
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-slideUp {
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
`

;(() => {
  const style = document.createElement("style")
  style.textContent = styles
  document.head.appendChild(style)
})()

export default TablaControl