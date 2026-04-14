import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../components/LoginPage";
import RegistroPage from "../components/Registro";
import OlvidasteContrasenaPage from "../components/olvidaste-contrasena";
import HomePage from "../components/HomePage";
import PanelAdmin from "../Components/Administrador/PanelAdmin";
import ActivityManagementPage from "../Components/Administrador/Actividades";
import HistorialPage from "../Components/Administrador/Bitacora";
import UsuariosPage from "../Components/Administrador/Usuarios";
import MultimediaPage from "../Components/Administrador/Multimedia";
import ItinerarioActividadPage from "../Components/Administrador/ItinerarioActividad";
import FichaTecnicaAdminPage from "../Components/Administrador/FichaTecnicaAdmin";
import FichaMedicaPage from "../Components/Turista/components/FichaMedica";
import PanelOperaciones from "../Components/Operaciones/PanelOperaciones";
import ItinerarioPage from "../Components/Operaciones/components/GestionItinerarios";
import VerItinerarioPage from "../Components/Operaciones/components/VerItinerario";
import ListaPreSalidaPage from "../Components/Operaciones/components/ListaPreSalida";
import ReportePostActividadPage from "../Components/Operaciones/components/ReportePostActividad";
import ReservasPage from "../Components/Turista/components/Reservas";
import ReportesPage from "../Components/Administrador/Reportes";
import ReportesActividadPage from "../Components/Administrador/ReportesActividad";
import SalidaConfirmadaPage from "../Components/Administrador/SalidaConfirmada";
import ReservasAdminPage from "../Components/Administrador/ReservasAdmin";
import UserProfilePage from "../components/UserProfilePage";
import UnauthorizedPage from "../components/UnauthorizedPage";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../hooks/useAuth";

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
      {/* Modificación: Si está autenticado y va a /login, redirigir a /perfil en lugar de /home */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/perfil" /> : <LoginPage />}
      />
      <Route
        path="/registro"
        element={isAuthenticated ? <Navigate to="/perfil" /> : <RegistroPage />}
      />
      <Route
        path="/olvidaste-contrasena"
        element={
          isAuthenticated ? (
            <Navigate to="/perfil" />
          ) : (
            <OlvidasteContrasenaPage />
          )
        }
      />
      <Route path="/" element={<HomePage />} />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        }
      />
      {/* Panel de Administración — layout con sidebar + rutas hijas */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <PanelAdmin />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="actividades" replace />} />
        <Route path="actividades"    element={<ActivityManagementPage />} />
        <Route path="reservas"       element={<ReservasAdminPage />} />
        <Route path="usuarios"       element={<UsuariosPage />} />
        <Route path="historial"      element={<HistorialPage />} />
        <Route path="multimedia"            element={<MultimediaPage />} />
        <Route path="itinerario-actividad"  element={<ItinerarioActividadPage />} />
        <Route path="ficha-tecnica"         element={<FichaTecnicaAdminPage />} />
        <Route path="fichas-medicas" element={<FichaMedicaPage />} />
        <Route path="itinerarios"    element={<ItinerarioPage />} />
        <Route path="reportes"            element={<ReportesPage />} />
        <Route path="salida-confirmada"   element={<SalidaConfirmadaPage />} />
        <Route path="reportes-actividad" element={<ReportesActividadPage />} />
      </Route>

      {/* Panel de Operaciones — layout con sidebar + rutas hijas */}
      <Route
        path="/operaciones"
        element={
          <ProtectedRoute requiredPermissions={["ver_itinerarios"]}>
            <PanelOperaciones />
          </ProtectedRoute>
        }
      >
        {/* Redirigir /operaciones → /operaciones/itinerario por defecto */}
        <Route index element={<Navigate to="itinerario" replace />} />
        <Route path="itinerario"  element={<VerItinerarioPage />} />
        <Route path="itinerarios" element={<ItinerarioPage />} />
        <Route
          path="pre-salida"
          element={
            <ProtectedRoute requiredPermissions={["ver_reservas"]}>
              <ListaPreSalidaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reporte"
          element={
            <ProtectedRoute requiredPermissions={["crear_reporte_actividad"]}>
              <ReportePostActividadPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route
        path="/reservas"
        element={
          <ProtectedRoute requiredPermissions={["ver_reservas"]}>
            <ReservasPage />
          </ProtectedRoute>
        }
      />
      <Route path="/no-autorizado" element={<UnauthorizedPage />} />

      {/* Ruta por defecto para cualquier otra URL no definida */}
      {/* Si está autenticado, la ruta por defecto es /perfil (si se quiere que sea la "nueva home" tras login), o / si HomePage es la home general */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
      />
    </Routes>
  );
};

export default AppRouter;
