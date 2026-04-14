"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../imag/logo.png";
import toast from "../../utils/toast";

// Configuración de axios
const API_BASE_URL = "/api";

// Configurar interceptor para incluir token en todas las peticiones
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [perfilModalOpen, setPerfilModalOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  // Verificar si hay token al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setPerfilModalOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Obtener información del perfil
  const obtenerPerfil = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      setUsuario(response.data);
      setPerfilModalOpen(true);
    } catch (error) {
      console.error("Error obteniendo perfil:", error);
      if (error.response?.status === 401) {
        // Token inválido, cerrar sesión
        cerrarSesion();
      } else {
        toast.error("Error al cargar el perfil");
      }
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUsuario(null);
    setMenuOpen(false);
    navigate("/login");
  };

  // Formatear fecha
  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString("es-BO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white bg-opacity-60 shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <img
            src={logo || "/placeholder.svg"}
            alt="Logo estilizado con letras TEC en colores vivos representando Bolivia Deporte Extremo"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
          />
          <span className="font-extrabold text-xl sm:text-2xl text-red-700 select-none">
            <span className="hidden sm:inline">Deporte Extremo</span>
            <span className="sm:hidden">DE</span>
          </span>
        </div>

        <div
          className="flex items-center space-x-2 sm:space-x-4 relative"
          ref={menuRef}
        >
          <input
            type="search"
            placeholder="Buscar..."
            className="border border-gray-300 rounded-md px-2 sm:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm w-32 sm:w-48 md:w-64 text-red-700"
            aria-label="Buscar"
          />
          <button
            aria-label="Menú desplegable"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-2 rounded-md bg-red-600 hover:bg-red-700 text-white shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400`}
          >
            <i className="fas fa-bars fa-lg"></i>
          </button>

          {menuOpen && (
            <ul className="absolute right-0 top-full mt-2 w-40 sm:w-44 bg-white border border-gray-200 rounded-md shadow-lg text-red-700 text-sm font-semibold z-50">
              {!isLoggedIn ? (
                <>
                  <li>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-red-100 transition-colors"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/login");
                      }}
                    >
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Acceder
                    </button>
                  </li>
                  <li>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-red-100 transition-colors"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/registro");
                      }}
                    >
                      <i className="fas fa-user-plus mr-2"></i>
                      Registrar
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-red-100 transition-colors"
                      onClick={() => {
                        setMenuOpen(false);
                        obtenerPerfil();
                      }}
                      disabled={loading}
                    >
                      <i className="fas fa-user mr-2"></i>
                      {loading ? "Cargando..." : "Ver Perfil"}
                    </button>
                  </li>
                  <li>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-red-100 transition-colors text-red-600"
                      onClick={cerrarSesion}
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Cerrar Sesión
                    </button>
                  </li>
                </>
              )}
            </ul>
          )}
        </div>
      </header>

      {/* Modal de Perfil */}
      {perfilModalOpen && usuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            {/* Header del modal */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                <i className="fas fa-user-circle mr-2 text-red-700"></i>
                Mi Perfil
              </h2>
              <button
                onClick={() => setPerfilModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl focus:outline-none"
              >
                ×
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Información básica */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <i className="fas fa-info-circle mr-2 text-blue-600"></i>
                  Información Personal
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Nombre:</span>
                    <span className="text-gray-800">{usuario.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Email:</span>
                    <span className="text-gray-800 break-all">
                      {usuario.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">CI:</span>
                    <span className="text-gray-800">{usuario.ci}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Celular:</span>
                    <span className="text-gray-800">{usuario.celular}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Estado:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        usuario.activo
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Roles */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <i className="fas fa-user-tag mr-2 text-purple-600"></i>
                  Roles ({usuario.roles?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {usuario.roles?.map((rol, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {rol}
                    </span>
                  )) || (
                    <span className="text-gray-500 text-sm">
                      Sin roles asignados
                    </span>
                  )}
                </div>
              </div>

              {/* Permisos */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <i className="fas fa-key mr-2 text-green-600"></i>
                  Permisos ({usuario.permisos?.length || 0})
                </h3>
                <div className="max-h-32 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-1">
                    {usuario.permisos?.map((permiso, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                      >
                        {permiso.replace(/_/g, " ")}
                      </span>
                    )) || (
                      <span className="text-gray-500 text-sm">
                        Sin permisos asignados
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <i className="fas fa-calendar mr-2 text-yellow-600"></i>
                  Información de Cuenta
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">
                      Cuenta creada:
                    </span>
                    <div className="text-gray-800">
                      {formatearFecha(usuario.createdAt)}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Última actualización:
                    </span>
                    <div className="text-gray-800">
                      {formatearFecha(usuario.updatedAt)}
                    </div>
                  </div>
                  {usuario.ultimoLogin && (
                    <div>
                      <span className="font-medium text-gray-600">
                        Último acceso:
                      </span>
                      <div className="text-gray-800">
                        {formatearFecha(usuario.ultimoLogin)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="p-4 sm:p-6 border-t border-gray-200">
              <button
                onClick={() => setPerfilModalOpen(false)}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
