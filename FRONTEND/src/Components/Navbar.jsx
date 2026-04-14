import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../imag/logo.png";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-red-600 to-red-700 shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src={logo}
              alt="Logo"
              className="w-12 h-12 transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-white font-bold text-xl tracking-wide hidden sm:block">
              DEPORTE EXTREMO
            </span>
          </Link>

          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <NotificationBell />
              {/* Mi Perfil */}
              <Link
                to="/perfil"
                className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Mi Perfil
              </Link>

              {/* Avatar + nombre */}
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {user.nombre?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white font-medium text-sm hidden sm:block">
                  {user.nombre}
                </span>
              </div>

              {/* Cerrar sesión */}
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/40 text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-white text-red-600 hover:bg-red-50 font-semibold py-2 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;