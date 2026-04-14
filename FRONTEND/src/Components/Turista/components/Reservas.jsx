"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MapPin,
  Bell,
  BellOff,
  Users,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import axios from "axios";

const API_BASE_URL = "/api";

// Configuración de axios con interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Constantes
const ESTADOS_RESERVA = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
};

const TIPOS_TOUR = {
  PROMOCIONAL: "Promocional",
  VIP: "VIP",
  INTERMEDIO: "Intermedio",
};

const CATEGORIAS = {
  PRINCIPIANTE: "Principiante",
  INTERMEDIO: "Intermedio",
  AVANZADO: "Avanzado",
};

const MODALES = {
  CREAR: "crear",
  EDITAR: "editar",
  VER: "ver",
};

const GestionReservas = () => {
  const { user } = useAuth();
  const [state, setState] = useState({
    reservas: [],
    actividades: [],
    usuarios: [],
    loading: true,
    error: "",
  });
  
  const [modal, setModal] = useState({
    abierto: false,
    tipo: "",
    reservaSeleccionada: null,
  });
  
  const [filtros, setFiltros] = useState({
    busqueda: "",
    estado: "",
    actividad: "",
    usuario: "",
  });
  
  const [formulario, setFormulario] = useState(getInitialFormState());

  // Permisos memoizados
  const permisos = useMemo(() => ({
    puedeVer: user?.permisos?.includes("ver_reservas") || false,
    puedeVerMisReservas: user?.permisos?.includes("ver_mis_reservas") || false,
    puedeCrear: user?.permisos?.includes("crear_reservas") || false,
    puedeEditar: user?.permisos?.includes("editar_reservas") || false,
    puedeEliminar: user?.permisos?.includes("eliminar_reservas") || false,
    puedeVerEspecifica: user?.permisos?.includes("ver_reserva_especifica") || false,
  }), [user?.permisos]);

  const roles = useMemo(() => ({
    esAdmin: user?.roles?.includes("admin") || false,
    esTurista: user?.roles?.includes("turista") || false,
  }), [user?.roles]);

  // Funciones helper
  function getInitialFormState(reserva = null) {
    if (reserva) {
      return {
        usuario: reserva.usuario?._id || "",
        actividad: reserva.actividad?._id || "",
        fechaActividad: reserva.fechaActividad?.split("T")[0] || "",
        tipoTour: reserva.tipoTour || "",
        numeroPersonas: reserva.numeroPersonas || 1,
        categoria: reserva.categoria || "",
        costoTotal: reserva.costoTotal || 0,
        estado: reserva.estado || ESTADOS_RESERVA.PENDIENTE,
      };
    }
    // No usar `roles` aquí porque aún no está inicializado en la primera llamada.
    // El usuario turista se asigna via useEffect cuando `user` ya está disponible.
    return {
      usuario: "",
      actividad: "",
      fechaActividad: "",
      tipoTour: "",
      numeroPersonas: 1,
      categoria: "",
      costoTotal: 0,
      estado: ESTADOS_RESERVA.PENDIENTE,
    };
  }

  const getEstadoConfig = (estado) => {
    const config = {
      [ESTADOS_RESERVA.CONFIRMADA]: {
        icono: <CheckCircle className="w-5 h-5 text-green-500" />,
        color: "bg-green-100 text-green-800",
      },
      [ESTADOS_RESERVA.CANCELADA]: {
        icono: <XCircle className="w-5 h-5 text-red-500" />,
        color: "bg-red-100 text-red-800",
      },
      default: {
        icono: <Clock className="w-5 h-5 text-yellow-500" />,
        color: "bg-yellow-100 text-yellow-800",
      },
    };
    return config[estado] || config.default;
  };

  // Carga de datos
  const cargarDatos = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: "" }));
      
      const promises = [];
      
      // Reservas según permisos
      if (roles.esAdmin && permisos.puedeVer) {
        promises.push(axios.get(`${API_BASE_URL}/reservas`));
      } else if ((roles.esTurista || permisos.puedeVerMisReservas) && permisos.puedeVer) {
        promises.push(axios.get(`${API_BASE_URL}/reservas/mis_reservas`));
      } else if (permisos.puedeVer) {
        promises.push(axios.get(`${API_BASE_URL}/reservas`));
      } else {
        promises.push(Promise.resolve({ data: [] }));
      }

      // Actividades (si tiene permisos)
      promises.push(
        (permisos.puedeCrear || permisos.puedeEditar)
          ? axios.get(`${API_BASE_URL}/actividades`).catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] })
      );

      // Usuarios (solo admin)
      promises.push(
        roles.esAdmin
          ? axios.get(`${API_BASE_URL}/usuarios`).catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] })
      );

      const [reservasRes, actividadesRes, usuariosRes] = await Promise.all(promises);

      setState({
        reservas: Array.isArray(reservasRes.data) ? reservasRes.data : [],
        actividades: Array.isArray(actividadesRes.data) ? actividadesRes.data : [],
        usuarios: Array.isArray(usuariosRes.data) ? usuariosRes.data : [],
        loading: false,
        error: "",
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.msg || error.response?.data?.error || "Error al cargar datos",
      }));
    }
  }, [roles, permisos]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Cuando el user se carga y es turista, pre-rellenar el campo usuario del formulario
  useEffect(() => {
    if (roles.esTurista && user?.id) {
      setFormulario(prev => ({ ...prev, usuario: user.id }));
    }
  }, [roles.esTurista, user?.id]);

  // Filtrado de reservas
  const reservasFiltradas = useMemo(() => {
    return state.reservas.filter(reserva => {
      const busquedaLower = filtros.busqueda.toLowerCase();
      const cumpleBusqueda = !filtros.busqueda || 
        reserva.usuario?.nombre?.toLowerCase().includes(busquedaLower) ||
        reserva.actividad?.nombre?.toLowerCase().includes(busquedaLower);

      const cumpleEstado = !filtros.estado || reserva.estado === filtros.estado;
      const cumpleActividad = !filtros.actividad || reserva.actividad?._id === filtros.actividad;
      const cumpleUsuario = !filtros.usuario || reserva.usuario?._id === filtros.usuario;

      return cumpleBusqueda && cumpleEstado && cumpleActividad && cumpleUsuario;
    });
  }, [state.reservas, filtros]);

  // Estadísticas
  const estadisticas = useMemo(() => ({
    confirmadas: reservasFiltradas.filter(r => r.estado === ESTADOS_RESERVA.CONFIRMADA).length,
    pendientes: reservasFiltradas.filter(r => r.estado === ESTADOS_RESERVA.PENDIENTE).length,
    canceladas: reservasFiltradas.filter(r => r.estado === ESTADOS_RESERVA.CANCELADA).length,
  }), [reservasFiltradas]);

  // Handlers del modal
  const abrirModal = (tipo, reserva = null) => {
    setModal({
      abierto: true,
      tipo,
      reservaSeleccionada: reserva,
    });
    setFormulario(getInitialFormState(reserva));
  };

  const cerrarModal = () => {
    setModal({
      abierto: false,
      tipo: "",
      reservaSeleccionada: null,
    });
    setFormulario(getInitialFormState());
    setState(prev => ({ ...prev, error: "" }));
  };

  // Handlers de formulario
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormulario(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name) => (e) => {
    setFormulario(prev => ({ ...prev, [name]: e.target.value }));
  };

  // Operaciones CRUD
  const crearReserva = async () => {
    if (!validarFormulario()) return;

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const body = {
        actividad: formulario.actividad,
        tipoTour: formulario.tipoTour,
        fechaActividad: formulario.fechaActividad,
        numeroPersonas: formulario.numeroPersonas,
        categoria: formulario.categoria,
        costoTotal: formulario.costoTotal,
      };

      if (roles.esAdmin && formulario.usuario && !roles.esTurista) {
        body.usuario = formulario.usuario;
      }

      await axios.post(`${API_BASE_URL}/reservas`, body);
      await cargarDatos();
      cerrarModal();
    } catch (error) {
      manejarError(error);
    }
  };

  const editarReserva = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const body = {
        actividad: formulario.actividad,
        fechaActividad: formulario.fechaActividad,
        tipoTour: formulario.tipoTour,
        numeroPersonas: formulario.numeroPersonas,
        categoria: formulario.categoria,
        costoTotal: formulario.costoTotal,
        estado: formulario.estado,
      };

      if (formulario.usuario?.trim()) {
        body.usuario = formulario.usuario;
      }

      await axios.put(`${API_BASE_URL}/reservas/${modal.reservaSeleccionada._id}`, body);
      await cargarDatos();
      cerrarModal();
    } catch (error) {
      manejarError(error);
    }
  };

  const eliminarReserva = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta reserva?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/reservas/${id}`);
      await cargarDatos();
    } catch (error) {
      manejarError(error);
    }
  };

  const cancelarReserva = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta reserva?")) return;
    try {
      await axios.put(`${API_BASE_URL}/reservas/${id}`, { estado: "Cancelada" });
      await cargarDatos();
    } catch (error) {
      manejarError(error);
    }
  };

  // Helpers
  const validarFormulario = () => {
    const camposRequeridos = ["actividad", "fechaActividad", "tipoTour"];
    const camposFaltantes = camposRequeridos.filter(campo => !formulario[campo]);
    
    if (camposFaltantes.length > 0) {
      setState(prev => ({ ...prev, error: "Por favor completa todos los campos requeridos" }));
      return false;
    }
    return true;
  };

  const manejarError = (error) => {
    setState(prev => ({
      ...prev,
      loading: false,
      error: error.response?.data?.error || error.response?.data?.msg || "Error en la operación",
    }));
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatearMoneda = (monto) => {
    return `Bs. ${monto?.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`;
  };

  // Render condicional por permisos
  if (state.loading && state.reservas.length === 0) {
    return <LoadingSpinner />;
  }

  if (!permisos.puedeVer && !permisos.puedeVerMisReservas) {
    return <AccesoDenegado />;
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Header 
          esAdmin={roles.esAdmin}
          puedeVer={permisos.puedeVer}
          puedeCrear={permisos.puedeCrear}
          onNuevaReserva={() => abrirModal(MODALES.CREAR)}
        />
        
        <Filtros 
          filtros={filtros}
          setFiltros={setFiltros}
          actividades={state.actividades}
          usuarios={state.usuarios}
          esAdmin={roles.esAdmin}
        />

        {state.error && <MensajeError error={state.error} />}

        <TablaReservas
          reservas={reservasFiltradas}
          esAdmin={roles.esAdmin}
          esTurista={roles.esTurista}
          puedeVer={permisos.puedeVer}
          permisos={permisos}
          onVer={(reserva) => abrirModal(MODALES.VER, reserva)}
          onEditar={(reserva) => abrirModal(MODALES.EDITAR, reserva)}
          onEliminar={eliminarReserva}
          onCancelar={cancelarReserva}
          puedeCrear={permisos.puedeCrear}
          onNuevaReserva={() => abrirModal(MODALES.CREAR)}
          formatearFecha={formatearFecha}
          getEstadoConfig={getEstadoConfig}
        />

        <Estadisticas estadisticas={estadisticas} />
      </div>

      <ModalReserva
        modal={modal}
        onCerrar={cerrarModal}
        tipo={modal.tipo}
        reserva={modal.reservaSeleccionada}
        formulario={formulario}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        actividades={state.actividades}
        usuarios={state.usuarios}
        esAdmin={roles.esAdmin}
        esTurista={roles.esTurista}
        onCrear={crearReserva}
        onEditar={editarReserva}
        loading={state.loading}
        formatearFecha={formatearFecha}
        formatearMoneda={formatearMoneda}
        getEstadoConfig={getEstadoConfig}
      />
    </div>
  );
};

// Componentes separados para mejor legibilidad
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const AccesoDenegado = () => (
  <div className="text-center py-12">
    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso Denegado</h3>
    <p className="text-gray-600">No tienes permisos para ver las reservas.</p>
  </div>
);

const MensajeError = ({ error }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
    <AlertCircle className="w-5 h-5 mr-2" />
    {error}
  </div>
);

const Header = ({ esAdmin, puedeVer, puedeCrear, onNuevaReserva }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <div className="flex items-center mb-4 md:mb-0">
        <Calendar className="w-8 h-8 text-blue-600 mr-3" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {esAdmin && puedeVer ? "Gestión de Reservas" : "Mis Reservas"}
          </h1>
          <p className="text-gray-600">
            {esAdmin && puedeVer
              ? "Administra todas las reservas del sistema"
              : "Consulta y gestiona tus reservas"}
          </p>
        </div>
      </div>

      {puedeCrear && (
        <button
          onClick={onNuevaReserva}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Reserva
        </button>
      )}
    </div>
  </div>
);

const Filtros = ({ filtros, setFiltros, actividades, usuarios, esAdmin }) => {
  const handleFiltroChange = (campo) => (e) => {
    setFiltros(prev => ({ ...prev, [campo]: e.target.value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar reservas..."
            value={filtros.busqueda}
            onChange={handleFiltroChange("busqueda")}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={filtros.estado}
          onChange={handleFiltroChange("estado")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los estados</option>
          {Object.values(ESTADOS_RESERVA).map(estado => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>

        {actividades.length > 0 && (
          <select
            value={filtros.actividad}
            onChange={handleFiltroChange("actividad")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las actividades</option>
            {actividades.map(actividad => (
              <option key={actividad._id} value={actividad._id}>
                {actividad.nombre}
              </option>
            ))}
          </select>
        )}

        {esAdmin && usuarios.length > 0 && (
          <select
            value={filtros.usuario}
            onChange={handleFiltroChange("usuario")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los usuarios</option>
            {usuarios.map(usuario => (
              <option key={usuario._id} value={usuario._id}>
                {usuario.nombre}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

const TablaReservas = ({
  reservas,
  esAdmin,
  esTurista,
  puedeVer,
  permisos,
  onVer,
  onEditar,
  onEliminar,
  onCancelar,
  puedeCrear,
  onNuevaReserva,
  formatearFecha,
  getEstadoConfig
}) => {
  if (reservas.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-12 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No hay reservas disponibles</p>
        {puedeCrear && (
          <button
            onClick={onNuevaReserva}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Crear primera reserva
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {esAdmin && puedeVer && <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>}
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notificación</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservas.map((reserva, index) => {
              const estadoConfig = getEstadoConfig(reserva.estado);
              
              return (
                <tr key={reserva._id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  {esAdmin && puedeVer && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {reserva.usuario?.nombre?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {reserva.usuario?.nombre || "Usuario no disponible"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reserva.usuario?.email || ""}
                          </div>
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {reserva.actividad?.nombre || "Actividad no disponible"}
                        </div>
                        <div className="text-sm text-gray-500">
                          Riesgo: {reserva.actividad?.nivelRiesgo || "No especificado"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatearFecha(reserva.fechaActividad)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${estadoConfig.color}`}>
                      {estadoConfig.icono}
                      <span className="ml-2">{reserva.estado}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {reserva.notificacionEnviada ? (
                        <Bell className="w-5 h-5 text-green-500" />
                      ) : (
                        <BellOff className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="ml-2 text-sm text-gray-600">
                        {reserva.notificacionEnviada ? "Notificado ✓" : "Sin notificar"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {permisos.puedeVerEspecifica && (
                        <button
                          onClick={() => onVer(reserva)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {/* Turista: solo puede cancelar reservas pendientes */}
                      {esTurista ? (
                        reserva.estado === ESTADOS_RESERVA.PENDIENTE && (
                          <button
                            onClick={() => onCancelar(reserva._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors duration-200 border border-red-200"
                            title="Cancelar reserva"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancelar
                          </button>
                        )
                      ) : (
                        <>
                          {permisos.puedeEditar && (
                            <button
                              onClick={() => onEditar(reserva)}
                              className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {permisos.puedeEliminar && (
                            <button
                              onClick={() => onEliminar(reserva._id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Estadisticas = ({ estadisticas }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Confirmadas</p>
          <p className="text-2xl font-bold text-gray-900">{estadisticas.confirmadas}</p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Pendientes</p>
          <p className="text-2xl font-bold text-gray-900">{estadisticas.pendientes}</p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
          <XCircle className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Canceladas</p>
          <p className="text-2xl font-bold text-gray-900">{estadisticas.canceladas}</p>
        </div>
      </div>
    </div>
  </div>
);

const ModalReserva = ({
  modal,
  onCerrar,
  tipo,
  reserva,
  formulario,
  onInputChange,
  onSelectChange,
  actividades,
  usuarios,
  esAdmin,
  esTurista,
  onCrear,
  onEditar,
  loading,
  formatearFecha,
  formatearMoneda,
  getEstadoConfig,
}) => {
  if (!modal.abierto) return null;

  const getTituloModal = () => {
    if (tipo === MODALES.CREAR) return "Nueva Reserva";
    if (tipo === MODALES.EDITAR) return "Editar Reserva";
    return "Detalles de Reserva";
  };

  const getColorHeader = () => {
    if (tipo === MODALES.CREAR) return "bg-gradient-to-r from-blue-500 to-indigo-500";
    if (tipo === MODALES.EDITAR) return "bg-gradient-to-r from-indigo-500 to-purple-500";
    return "bg-gradient-to-r from-gray-500 to-gray-600";
  };

  const handleSubmit = () => {
    if (tipo === MODALES.CREAR) onCrear();
    else onEditar();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className={`px-6 py-4 border-b border-gray-200 ${getColorHeader()}`}>
          <h3 className="text-xl font-semibold text-white">{getTituloModal()}</h3>
        </div>

        <div className="p-6">
          {tipo === MODALES.VER ? (
            <DetallesReserva 
              reserva={reserva} 
              formatearFecha={formatearFecha} 
              formatearMoneda={formatearMoneda} 
              getEstadoConfig={getEstadoConfig} 
            />
          ) : (
            <FormularioReserva
              formulario={formulario}
              onInputChange={onInputChange}
              onSelectChange={onSelectChange}
              actividades={actividades}
              usuarios={usuarios}
              esAdmin={esAdmin}
              esTurista={esTurista}
              tipo={tipo}
            />
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onCerrar}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            disabled={loading}
          >
            {tipo === MODALES.VER ? "Cerrar" : "Cancelar"}
          </button>

          {tipo !== MODALES.VER && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white transition-colors duration-200 ${
                tipo === MODALES.CREAR
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Procesando..." : (tipo === MODALES.CREAR ? "Crear Reserva" : "Guardar Cambios")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const DetallesReserva = ({ reserva, formatearFecha, formatearMoneda, getEstadoConfig }) => {
  if (!reserva) return null;

  const estadoConfig = getEstadoConfig(reserva.estado);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CampoDetalle 
          label="Usuario" 
          icono={<User className="w-5 h-5 text-gray-400" />}
        >
          <p className="font-medium text-gray-900">{reserva.usuario?.nombre || "No disponible"}</p>
          <p className="text-sm text-gray-500">{reserva.usuario?.email || ""}</p>
        </CampoDetalle>

        <CampoDetalle 
          label="Actividad" 
          icono={<MapPin className="w-5 h-5 text-gray-400" />}
        >
          <p className="font-medium text-gray-900">{reserva.actividad?.nombre || "No disponible"}</p>
          <p className="text-sm text-gray-500">Riesgo: {reserva.actividad?.nivelRiesgo || "No especificado"}</p>
        </CampoDetalle>

        <CampoDetalle 
          label="Fecha de Actividad" 
          icono={<Calendar className="w-5 h-5 text-gray-400" />}
        >
          <p className="font-medium text-gray-900">
            {reserva.fechaActividad ? formatearFecha(reserva.fechaActividad) : "No disponible"}
          </p>
        </CampoDetalle>

        <CampoDetalle label="Tipo de Tour">
          <p className="font-medium text-gray-900">{reserva.tipoTour || "No especificado"}</p>
        </CampoDetalle>

        <CampoDetalle 
          label="Número de Personas" 
          icono={<Users className="w-5 h-5 text-gray-400" />}
        >
          <p className="font-medium text-gray-900">{reserva.numeroPersonas || 1} persona(s)</p>
        </CampoDetalle>

        <CampoDetalle label="Categoría">
          <p className="font-medium text-gray-900">{reserva.categoria || "No especificado"}</p>
        </CampoDetalle>

        <CampoDetalle 
          label="Costo Total" 
          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
          icono={<DollarSign className="w-5 h-5 text-green-600" />}
        >
          <p className="font-bold text-green-700 text-lg">{formatearMoneda(reserva.costoTotal)}</p>
        </CampoDetalle>

        <CampoDetalle label="Estado">
          <div className="flex items-center">
            {estadoConfig.icono}
            <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${estadoConfig.color}`}>
              {reserva.estado}
            </span>
          </div>
        </CampoDetalle>

        <CampoDetalle 
          label="Notificación" 
          icono={reserva.notificacionEnviada ? <Bell className="w-5 h-5 text-green-500" /> : <BellOff className="w-5 h-5 text-gray-400" />}
        >
          <span className="text-gray-900">{reserva.notificacionEnviada ? "Notificado ✓" : "Sin notificar"}</span>
        </CampoDetalle>

        <CampoDetalle 
          label="Fecha de Creación" 
          icono={<Clock className="w-5 h-5 text-gray-400" />}
        >
          <span className="text-gray-900">
            {reserva.createdAt ? new Date(reserva.createdAt).toLocaleString("es-ES") : "No disponible"}
          </span>
        </CampoDetalle>
      </div>
    </div>
  );
};

const CampoDetalle = ({ label, children, icono, className = "bg-gray-50" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className={`flex items-center p-3 ${className} rounded-lg`}>
      {icono && <div className="mr-3">{icono}</div>}
      <div>{children}</div>
    </div>
  </div>
);

const FormularioReserva = ({
  formulario,
  onInputChange,
  onSelectChange,
  actividades,
  usuarios,
  esAdmin,
  esTurista,
  tipo,
}) => (
  <div className="space-y-6">
    {esAdmin && !esTurista && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Usuario *
        </label>
        <select
          name="usuario"
          value={formulario.usuario}
          onChange={onSelectChange("usuario")}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Seleccionar usuario</option>
          {usuarios.map(usuario => (
            <option key={usuario._id} value={usuario._id}>
              {usuario.nombre} - {usuario.email}
            </option>
          ))}
        </select>
      </div>
    )}

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Actividad *
      </label>
      <select
        name="actividad"
        value={formulario.actividad}
        onChange={onSelectChange("actividad")}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      >
        <option value="">Seleccionar actividad</option>
        {actividades.map(actividad => (
          <option key={actividad._id} value={actividad._id}>
            {actividad.nombre} - Riesgo: {actividad.nivelRiesgo}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Fecha de Actividad *
      </label>
      <input
        type="date"
        name="fechaActividad"
        value={formulario.fechaActividad}
        onChange={onInputChange}
        min={new Date().toISOString().split("T")[0]}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tipo de Tour *
      </label>
      <select
        name="tipoTour"
        value={formulario.tipoTour}
        onChange={onSelectChange("tipoTour")}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      >
        <option value="">Seleccionar tipo</option>
        {Object.entries(TIPOS_TOUR).map(([key, value]) => (
          <option key={key} value={value}>{value}</option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Número de Personas *
      </label>
      <input
        type="number"
        name="numeroPersonas"
        value={formulario.numeroPersonas}
        onChange={onInputChange}
        min="1"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Categoría *
      </label>
      <select
        name="categoria"
        value={formulario.categoria}
        onChange={onSelectChange("categoria")}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      >
        <option value="">Seleccionar categoría</option>
        {Object.entries(CATEGORIAS).map(([key, value]) => (
          <option key={key} value={value}>{value}</option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Costo Total (Bs)
      </label>
      <input
        type="number"
        name="costoTotal"
        value={formulario.costoTotal}
        onChange={onInputChange}
        min="0"
        step="0.01"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />
    </div>

    {tipo === MODALES.EDITAR && !esTurista && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estado
        </label>
        <select
          name="estado"
          value={formulario.estado}
          onChange={onSelectChange("estado")}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {Object.values(ESTADOS_RESERVA).map(estado => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
      </div>
    )}
  </div>
);

export default GestionReservas;