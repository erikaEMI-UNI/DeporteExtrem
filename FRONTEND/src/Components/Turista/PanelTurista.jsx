import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";

import initialActivities from "./data/initialActivities";
import initialReservations from "./data/initialReservations";
import initialLogs from "./data/initialLogs";
import sampleGuides from "./data/sampleGuides";
import sampleVehicles from "./data/sampleVehicles";
import sampleMaterials from "./data/sampleMaterials";
const links = [
  { id: "inicio", label: "Panel de Inicio" },
  { id: "actividades", label: "Actividades " },
  { id: "reservas", label: "Reservas" },
  { id: "fichamedica", label: "Ficha Medica" },

];

export default function PanelTurista() {
  const [activeTab, setActiveTab] = useState("inicio");

  useEffect(() => {
    const handler = (e) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener("navigate", handler);
    return () => window.removeEventListener("navigate", handler);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 text-2xl font-bold text-red-700">Panel de Turista</div>
        <nav className="flex flex-col space-y-1 p-2">
          {links.map((link) => (
            <NavLink
              key={link.id}
              to={`/turista/${link.id}`} // Asegúrate de que el prefijo /Turista esté aquí
              className={({ isActive }) =>
                `px-4 py-2 rounded-md font-medium transition-colors ${
                  isActive ? 'bg-red-100 text-red-700' : 'hover:bg-red-50'
                }`
              }
              onClick={() => setActiveTab(link.id)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 overflow-y-auto">
       

        {/* Renderiza el componente correspondiente a la ruta hija */}
        <Outlet /> {/* Aquí se renderizarán los componentes de las rutas hijas */}

        <footer className="mt-12 text-center text-gray-500 text-sm">
          &copy; 2025  Turismo Extremo - Panel Turista
        </footer>
      </main>
    </div>
  );
}
