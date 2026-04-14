import { NavLink, Outlet, useNavigate } from "react-router-dom";

const links = [
  { id: "itinerario",  label: "🗺️ Itinerario de Actividad" },
  { id: "itinerarios", label: "📅 Recursos / Agenda",        divider: true },
  { id: "pre-salida",  label: "📋 Lista pre-salida",         divider: true },
  { id: "reporte",     label: "📝 Reporte post-actividad" },
];

export default function PanelOperaciones() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-red-700">⚙️ Panel Operaciones</h1>
        </div>

        <nav className="flex flex-col space-y-1 p-2 flex-1">
          {links.map((link) => (
            <div key={link.id}>
              {link.divider && <div className="my-2 border-t border-gray-200" />}
              <NavLink
                to={`/operaciones/${link.id}`}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md font-medium transition-colors ${
                    isActive ? "bg-red-100 text-red-700" : "hover:bg-red-50 text-gray-700"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </div>
          ))}
        </nav>

        {/* Volver al perfil */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => navigate("/perfil")}
            className="w-full text-left px-4 py-2 rounded-md text-sm text-gray-500 hover:bg-gray-100 transition-colors"
          >
            ← Volver al perfil
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
        <footer className="mt-12 p-4 text-center text-gray-400 text-xs">
          © 2025 Turismo Extremo — Panel Operaciones
        </footer>
      </main>
    </div>
  );
}
