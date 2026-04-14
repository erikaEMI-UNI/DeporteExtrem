import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth.jsx";
import ProtectedRoute from "@/components/common/ProtectedRoute.jsx";
// Auth pages
import LoginPage from "@/features/auth/pages/LoginPage.jsx";
import RegistroPage from "@/features/auth/pages/Registro.jsx";
import OlvidasteContrasenaPage from "@/features/auth/pages/OlvidasteContrasena.jsx";
import HomePage from "@/components/ui/HomePage.jsx"; // Stub to create
import AdminPage from "@/features/admin/AdminPage.jsx";
import UsuariosPage from "@/features/usuarios/Usuarios.jsx";
import ReportesPage from "@/features/reportes/Reportes.jsx";
import UserProfilePage from "@/features/usuarios/UserProfilePage.jsx";
import ProtectedRoute from "@/components/common/ProtectedRoute.jsx";
import { useAuth } from "@/features/auth/useAuth.jsx";

const AppRouter = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/perfil" /> : <LoginPage />} />
      <Route path="/registro" element={isAuthenticated ? <Navigate to="/perfil" /> : <RegistroPage />} />
      <Route path="/olvidaste-contrasena" element={isAuthenticated ? <Navigate to="/perfil" /> : <OlvidasteContrasenaPage />} />
      <Route path="/" element={<HomePage />} />
      {/* Add more routes with stubs */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
    </Routes>
  );
};

export default AppRouter;

