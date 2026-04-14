"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import toast from "../../utils/toast";

// Configuración de axios
const API_BASE_URL = "/api";

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= ICONOS ================= */
const AlertTriangle = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4m0 4h.01" />
  </svg>
);

const UserPlus = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" x2="19" y1="8" y2="14" />
    <line x1="22" x2="16" y1="11" y2="11" />
  </svg>
);

const User = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const Mail = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IdCard = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="18" height="14" x="3" y="5" rx="2" />
    <circle cx="9" cy="12" r="2" />
    <path d="M16 10h3m-3 4h3" />
  </svg>
);

const Phone = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const Lock = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const Shield = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const Eye = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const Edit = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const Trash = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const X = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m18 6-12 12m0-12 12 12" />
  </svg>
);

const Check = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function UsuariosConPermisos() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [assigningRoles, setAssigningRoles] = useState(null);
  const [assigningPermissions, setAssigningPermissions] = useState(null);
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    ci: "",
    celular: "",
    password: "",
    roles: [],
    permisos: [],
  });

  // Verificación de permisos
  const puedeVerUsuarios = user?.permisos?.includes("ver_usuarios");
  const puedeCrearUsuarios = user?.permisos?.includes("crear_usuarios");
  const puedeVerUsuarioEspecifico = user?.permisos?.includes("ver_usuario_especifico");
  const puedeEditarUsuarios = user?.permisos?.includes("editar_usuarios");
  const puedeEliminarUsuarios = user?.permisos?.includes("eliminar_usuarios");
  const puedeActivarUsuarios = user?.permisos?.includes("activar_usuarios");
  const puedeDesactivarUsuarios = user?.permisos?.includes("desactivar_usuarios");
  const puedeVerRoles = user?.permisos?.includes("ver_roles");
  const puedeVerPermisos = user?.permisos?.includes("ver_permisos");

  const puedeAccionar = [
    "ver_usuario_especifico",
    "editar_usuarios",
    "eliminar_usuarios",
    "activar_usuarios",
    "desactivar_usuarios",
  ].some((p) => user?.permisos?.includes(p));

  const token = localStorage.getItem("authToken") || user?.token;

  useEffect(() => {
    if (token) {
      cargarDatos();
    }
  }, [token]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const promises = [];

      if (puedeVerUsuarios) promises.push(axios.get(`${API_BASE_URL}/usuarios`));
      if (puedeVerRoles) promises.push(axios.get(`${API_BASE_URL}/roles`));
      if (puedeVerPermisos) promises.push(axios.get(`${API_BASE_URL}/permisos`));

      const responses = await Promise.all(promises);
      let responseIndex = 0;

      if (puedeVerUsuarios) {
        setUsuarios(responses[responseIndex]?.data || []);
        responseIndex++;
      }
      if (puedeVerRoles) {
        setRoles(responses[responseIndex]?.data || []);
        responseIndex++;
      }
      if (puedeVerPermisos) {
        setPermisos(responses[responseIndex]?.data || []);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const verUsuarioPorId = async (id) => {
    if (!puedeVerUsuarioEspecifico) {
      toast.error("No tienes permisos para ver detalles de usuarios");
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/usuarios/${id}`);
      setViewingUser(response.data);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
      toast.error(error.response?.data?.error || "Error al obtener los detalles del usuario");
    }
  };

  const crearUsuario = async () => {
    if (!puedeCrearUsuarios) {
      toast.error("No tienes permisos para crear usuarios");
      return;
    }

    try {
      const userData = {
        ...newUser,
        roles: selectedRole ? [selectedRole] : [],
        permisos: selectedPermissions,
      };

      const response = await axios.post(`${API_BASE_URL}/usuarios`, userData);
      setUsuarios([...usuarios, response.data]);
      setIsCreateModalOpen(false);
      resetNewUser();
      toast.success("Usuario creado correctamente");
    } catch (error) {
      console.error("Error creando usuario:", error);
      toast.error(error.response?.data?.message || "Error al crear usuario");
    }
  };

  const resetNewUser = () => {
    setNewUser({
      nombre: "",
      email: "",
      ci: "",
      celular: "",
      password: "",
      roles: [],
      permisos: [],
    });
    setSelectedRole("");
    setSelectedPermissions([]);
  };

  const editarUsuario = async () => {
    if (!puedeEditarUsuarios) {
      toast.error("No tienes permisos para editar usuarios");
      return;
    }

    if (!editingUser) return;

    try {
      const payload = {
        nombre: editingUser.nombre,
        email: editingUser.email,
        ci: editingUser.ci,
        celular: editingUser.celular,
      };
      if (editingUser.nuevaContrasena && editingUser.nuevaContrasena.trim().length >= 6) {
        payload.nuevaContrasena = editingUser.nuevaContrasena.trim();
      }
      const response = await axios.put(`${API_BASE_URL}/usuarios/${editingUser._id}`, payload);

      setUsuarios(usuarios.map((u) => (u._id === editingUser._id ? response.data.usuario : u)));
      setIsEditModalOpen(false);
      setEditingUser(null);
      toast.success("Usuario actualizado correctamente");
    } catch (error) {
      console.error("Error editando usuario:", error);
      toast.error(error.response?.data?.message || "Error al editar usuario");
    }
  };

  const eliminarUsuario = async (usuario) => {
    if (!puedeEliminarUsuarios) {
      toast.error("No tienes permisos para eliminar usuarios");
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre}?`)) return;

    try {
      await axios.delete(`${API_BASE_URL}/usuarios/${usuario._id}`);
      setUsuarios(usuarios.filter((u) => u._id !== usuario._id));
      toast.success("Usuario eliminado correctamente");
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      toast.error(error.response?.data?.message || "Error al eliminar usuario");
    }
  };

  const esRolAdmin = (u) =>
    (u.roles || []).some((r) => (typeof r === "object" ? r.nombre : r) === "admin");

  const toggleActivarUsuario = async (usuario) => {
    // Los admins siempre permanecen activos
    if (esRolAdmin(usuario)) {
      toast.error("Los usuarios con rol administrador no pueden ser desactivados");
      return;
    }

    const accion = usuario.activo ? "desactivar" : "activar";
    const permisoRequerido = usuario.activo ? puedeDesactivarUsuarios : puedeActivarUsuarios;

    if (!permisoRequerido) {
      toast.error(`No tienes permisos para ${accion} usuarios`);
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/usuarios/${usuario._id}/${accion}`);
      setUsuarios(usuarios.map((u) => (u._id === usuario._id ? response.data.usuario : u)));
      toast.success(`Usuario ${accion === "activar" ? "activado" : "desactivado"} correctamente`);
    } catch (error) {
      console.error("Error cambiando estado del usuario:", error);
      toast.error(error.response?.data?.message || "Error al cambiar estado del usuario");
    }
  };

  const asignarRoles = async () => {
    if (!puedeEditarUsuarios) {
      toast.error("No tienes permisos para asignar roles");
      return;
    }

    if (!assigningRoles) return;

    try {
      const response = await axios.put(`${API_BASE_URL}/usuarios/${assigningRoles._id}`, {
        roles: selectedRole ? [selectedRole] : [],
      });

      setUsuarios(usuarios.map((u) => (u._id === assigningRoles._id ? response.data.usuario : u)));
      setIsRoleModalOpen(false);
      setAssigningRoles(null);
      setSelectedRole("");
      toast.success("Rol asignado correctamente");
    } catch (error) {
      console.error("Error asignando rol:", error);
      toast.error(error.response?.data?.message || "Error al asignar rol");
    }
  };

  const asignarPermisos = async () => {
    if (!puedeEditarUsuarios) {
      toast.error("No tienes permisos para asignar permisos");
      return;
    }

    if (!assigningPermissions) return;

    try {
      const response = await axios.put(`${API_BASE_URL}/usuarios/${assigningPermissions._id}`, {
        permisos: selectedPermissions,
      });

      setUsuarios(usuarios.map((u) => (u._id === assigningPermissions._id ? response.data.usuario : u)));
      setIsPermissionModalOpen(false);
      setAssigningPermissions(null);
      setSelectedPermissions([]);
      toast.success("Permisos asignados correctamente");
    } catch (error) {
      console.error("Error asignando permisos:", error);
      toast.error(error.response?.data?.message || "Error al asignar permisos");
    }
  };

  const abrirEditarUsuario = (usuario) => {
    if (!puedeEditarUsuarios) {
      toast.error("No tienes permisos para editar usuarios");
      return;
    }
    setEditingUser({ ...usuario });
    setIsEditModalOpen(true);
  };

  const abrirAsignarRoles = (usuario) => {
    if (!puedeEditarUsuarios) {
      toast.error("No tienes permisos para asignar roles");
      return;
    }
    setAssigningRoles(usuario);
    // roles puede ser array de objetos {nombre,_id} o de strings — extraer solo el nombre
    const primerRol = usuario.roles && usuario.roles.length > 0 ? usuario.roles[0] : "";
    setSelectedRole(primerRol?.nombre || primerRol || "");
    setIsRoleModalOpen(true);
  };

  const abrirAsignarPermisos = (usuario) => {
    if (!puedeEditarUsuarios) {
      toast.error("No tienes permisos para asignar permisos");
      return;
    }
    setAssigningPermissions(usuario);
    setSelectedPermissions([...(usuario.permisos || [])]);
    setIsPermissionModalOpen(true);
  };

  const toggleVip = async (usuario) => {
    if (!puedeEditarUsuarios) return toast.error("No tienes permisos para editar usuarios");
    try {
      const response = await axios.put(`${API_BASE_URL}/usuarios/${usuario._id}/toggle-vip`);
      setUsuarios(usuarios.map((u) => u._id === usuario._id ? response.data.usuario : u));
      toast.success(response.data.msg);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al cambiar estado VIP");
    }
  };

  const abrirCrearUsuario = () => {
    if (!puedeCrearUsuarios) {
      toast.error("No tienes permisos para crear usuarios");
      return;
    }
    resetNewUser();
    setIsCreateModalOpen(true);
  };

  const handlePermissionChange = (permisoCodename, checked) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permisoCodename]);
    } else {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permisoCodename));
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const roles = (u.roles || []).map((r) => (typeof r === "object" ? r.nombre : r));
    const rolOk = filtroRol === "" || roles.includes(filtroRol);
    const estadoOk =
      filtroEstado === "" ||
      (filtroEstado === "activo" && u.activo) ||
      (filtroEstado === "inactivo" && !u.activo);
    return rolOk && estadoOk;
  });

  if (!puedeVerUsuarios) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md border border-orange-200">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-orange-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Sin Permisos</h3>
          <p className="text-gray-600 text-center">
            No tienes permisos para ver usuarios. Contacta a un administrador.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-2">
                👥 Gestión de Usuarios
              </h1>
              <p className="text-gray-600">Administra usuarios, roles y permisos del sistema</p>
            </div>
            {puedeCrearUsuarios && (
              <button
                onClick={abrirCrearUsuario}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <UserPlus size={20} />
                Crear Usuario
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <span className="text-sm font-semibold text-gray-600 shrink-0">🔍 Filtrar por:</span>
            {/* Filtro rol */}
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
            >
              <option value="">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="operador">Operador</option>
              <option value="turista">Turista</option>
            </select>
            {/* Filtro estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
            {/* Contador + limpiar */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm text-gray-500">
                Mostrando <span className="font-bold text-red-600">{usuariosFiltrados.length}</span> de {usuarios.length}
              </span>
              {(filtroRol !== "" || filtroEstado !== "") && (
                <button
                  onClick={() => { setFiltroRol(""); setFiltroEstado(""); }}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors font-medium"
                >
                  ✕ Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold">#</th>
                  <th className="px-6 py-4 text-left font-semibold">Usuario</th>
                  <th className="px-6 py-4 text-left font-semibold">Contacto</th>
                  <th className="px-6 py-4 text-left font-semibold">Estado</th>
                  <th className="px-6 py-4 text-left font-semibold">VIP</th>
                  <th className="px-6 py-4 text-left font-semibold">Roles</th>
                  {puedeAccionar && <th className="px-6 py-4 text-left font-semibold">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={puedeAccionar ? "7" : "6"} className="px-6 py-12 text-center text-gray-500">
                      <User className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-lg font-medium">
                        {usuarios.length === 0 ? "No hay usuarios disponibles" : "Ningún usuario coincide con los filtros"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((usuario, index) => (
                    <tr key={usuario._id} className="border-t border-gray-100 hover:bg-red-50 transition-colors">
                      <td className="px-6 py-4 text-gray-700 font-semibold">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center">
                            <User className="text-white" size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{usuario.nombre}</p>
                            <p className="text-sm text-gray-500">CI: {usuario.ci}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Mail size={14} className="text-gray-400" />
                            <span className="text-sm">{usuario.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone size={14} className="text-gray-400" />
                            <span className="text-sm">{usuario.celular}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${usuario.activo ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
                          {usuario.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const roles = (usuario.roles || []).map(r => typeof r === "object" ? r.nombre : r);
                          const esTurista = roles.includes("turista") && !roles.includes("admin") && !roles.includes("operador");
                          if (!esTurista) return (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-400 border border-gray-200">—</span>
                          );
                          return puedeEditarUsuarios ? (
                          <button
                            onClick={() => toggleVip(usuario)}
                            title={usuario.esVip ? "Quitar VIP" : "Marcar como VIP"}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                              usuario.esVip
                                ? "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200"
                                : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300"
                            }`}
                          >
                            <span>{usuario.esVip ? "⭐" : "☆"}</span>
                            {usuario.esVip ? "VIP" : "Normal"}
                          </button>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                            usuario.esVip
                              ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}>
                            {usuario.esVip ? "⭐ VIP" : "☆ Normal"}
                          </span>
                        );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {usuario.roles && usuario.roles.length > 0 ? (
                            usuario.roles.map((rol, idx) => (
                              <span key={rol._id || rol.nombre || idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200">
                                {rol.nombre || rol}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs italic">Sin rol</span>
                          )}
                        </div>
                      </td>
                      {puedeAccionar && (
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {puedeVerUsuarioEspecifico && (
                              <button
                                onClick={() => verUsuarioPorId(usuario._id)}
                                className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                title="Ver detalles"
                              >
                                <Eye size={16} />
                              </button>
                            )}
                            {puedeEditarUsuarios && (
                              <button
                                onClick={() => abrirEditarUsuario(usuario)}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            {puedeEditarUsuarios && puedeVerRoles && (
                              <button
                                onClick={() => abrirAsignarRoles(usuario)}
                                className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                title="Asignar rol"
                              >
                                <Shield size={16} />
                              </button>
                            )}
                            {(puedeActivarUsuarios || puedeDesactivarUsuarios) && (
                              esRolAdmin(usuario) ? (
                                <button
                                  disabled
                                  title="Los administradores siempre permanecen activos"
                                  className="p-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed border border-gray-200"
                                >
                                  <Lock size={16} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => toggleActivarUsuario(usuario)}
                                  className={`p-2 text-white rounded-lg transition-colors ${usuario.activo ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600"}`}
                                  title={usuario.activo ? "Desactivar usuario" : "Activar usuario"}
                                >
                                  {usuario.activo ? <X size={16} /> : <Check size={16} />}
                                </button>
                              )
                            )}
                            {puedeEliminarUsuarios && (
                              <button
                                onClick={() => eliminarUsuario(usuario)}
                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                title="Eliminar"
                              >
                                <Trash size={16} />
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

      {/* Modal Crear Usuario */}
      {isCreateModalOpen && puedeCrearUsuarios && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Crear Nuevo Usuario</h3>
                <p className="text-blue-100 text-sm">Complete la información del usuario</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Información Personal</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newUser.nombre}
                          onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "") })}
                          placeholder="Ingrese el nombre completo"
                          maxLength={50}
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input
                          type="email"
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value.toLowerCase() })}
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CI *</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newUser.ci}
                          onChange={(e) => setNewUser({ ...newUser, ci: e.target.value.replace(/\D/g, "") })}
                          placeholder="12345678"
                          maxLength={15}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Celular *</label>
                        <input
                          type="tel"
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newUser.celular}
                          onChange={(e) => setNewUser({ ...newUser, celular: e.target.value.replace(/\D/g, "") })}
                          placeholder="70123456"
                          maxLength={12}
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña *</label>
                        <input
                          type="password"
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          placeholder="Contraseña segura"
                          minLength={6}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {puedeVerRoles && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Rol del Usuario</h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <input
                            type="radio"
                            id="no-role"
                            name="role"
                            value=""
                            checked={selectedRole === ""}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="mr-3"
                          />
                          <label htmlFor="no-role" className="text-sm text-gray-600 cursor-pointer flex-1">
                            Sin rol asignado
                          </label>
                        </div>
                        {roles.map((rol) => (
                          <div key={rol._id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <input
                              type="radio"
                              id={`role-${rol._id}`}
                              name="role"
                              value={rol.nombre}
                              checked={selectedRole === rol.nombre}
                              onChange={(e) => setSelectedRole(e.target.value)}
                              className="mr-3"
                            />
                            <label htmlFor={`role-${rol._id}`} className="text-sm cursor-pointer flex-1">
                              <div className="font-medium text-gray-800">{rol.nombre}</div>
                              <div className="text-gray-600 text-xs">{rol.descripcion}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={crearUsuario}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario */}
      {isEditModalOpen && editingUser && puedeEditarUsuarios && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-xl font-bold text-white">Editar Usuario</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingUser.nombre}
                  onChange={(e) => setEditingUser({ ...editingUser, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CI *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingUser.ci}
                  onChange={(e) => setEditingUser({ ...editingUser, ci: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Celular *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingUser.celular}
                  onChange={(e) => setEditingUser({ ...editingUser, celular: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña <span className="text-gray-400 font-normal text-xs">(dejar vacío para no cambiar)</span>
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingUser.nuevaContrasena || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, nuevaContrasena: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-3xl">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={editarUsuario}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Usuario */}
      {isViewModalOpen && viewingUser && puedeVerUsuarioEspecifico && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Detalles del Usuario</h3>
                <p className="text-gray-300 text-sm">ID: {viewingUser._id}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Nombre</label>
                    <p className="text-gray-900 font-medium">{viewingUser.nombre}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Email</label>
                    <p className="text-gray-900">{viewingUser.email}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">CI</label>
                    <p className="text-gray-900">{viewingUser.ci}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Celular</label>
                    <p className="text-gray-900">{viewingUser.celular}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Estado</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${viewingUser.activo ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
                      {viewingUser.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <div className={`rounded-xl shadow-sm border p-4 ${viewingUser.esVip ? "bg-yellow-50 border-yellow-300" : "bg-white border-gray-200"}`}>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Membresía</label>
                    {viewingUser.esVip ? (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⭐</span>
                        <div>
                          <p className="font-bold text-yellow-700">Usuario VIP</p>
                          <p className="text-xs text-yellow-600">Acceso a beneficios exclusivos</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">☆</span>
                        <p className="text-gray-500 font-medium">Usuario Normal</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Roles</label>
                    <div className="flex flex-wrap gap-2">
                      {viewingUser.roles && viewingUser.roles.length > 0 ? (
                        viewingUser.roles.map((rol, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                            {rol.nombre || rol}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">Sin roles</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales de Roles y Permisos (simplificados) */}
      {isRoleModalOpen && assigningRoles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-amber-600 to-yellow-600 px-6 py-4 rounded-t-3xl">
              <h3 className="text-xl font-bold text-white">Asignar Rol</h3>
            </div>
            <div className="p-6 space-y-3 max-h-64 overflow-y-auto">
              <div className="flex items-center p-3 border rounded-xl hover:bg-gray-50">
                <input
                  type="radio"
                  id="assign-no-role"
                  name="assignRole"
                  value=""
                  checked={selectedRole === ""}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mr-3"
                />
                <label htmlFor="assign-no-role" className="text-sm cursor-pointer">Sin rol</label>
              </div>
              {roles.map((rol) => (
                <div key={rol._id} className="flex items-center p-3 border rounded-xl hover:bg-gray-50">
                  <input
                    type="radio"
                    id={`assign-role-${rol._id}`}
                    name="assignRole"
                    value={rol.nombre}
                    checked={selectedRole === rol.nombre}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mr-3"
                  />
                  <label htmlFor={`assign-role-${rol._id}`} className="text-sm cursor-pointer flex-1">
                    <div className="font-medium">{rol.nombre}</div>
                    <div className="text-xs text-gray-600">{rol.descripcion}</div>
                  </label>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-3xl">
              <button onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600">
                Cancelar
              </button>
              <button onClick={asignarRoles} className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}