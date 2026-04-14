import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const links = [
  { path: "actividades",   label: "🎯 Gestión de Actividades",  perm: "listar_actividades"    },
  { path: "reservas",      label: "📋 Reservas",                perm: "ver_reservas"           },
  { path: "usuarios",      label: "👥 Usuarios",                perm: "ver_usuarios"           },
  { path: "historial",     label: "🗒️ Bitácora",                perm: "ver_historial",  divider: true },
  { path: "multimedia",             label: "🖼️ Multimedia",              perm: "ver_multimedia"         },
  { path: "ficha-tecnica",           label: "📋 Ficha Técnica",            perm: "editar_actividad"       },
  { path: "itinerario-actividad",   label: "🗺️ Itinerario de Actividad", perm: "crear_paso_itinerario"  },
  { path: "fichas-medicas",label: "🏥 Fichas Médicas",          perm: "ver_ficha_medica"       },
  { path: "itinerarios",   label: "📅 Recursos / Agenda",        perm: "ver_itinerarios"        },
  { path: "reportes",            label: "📊 Reportes",                   perm: "ver_reporte_reservas",   divider: true },
  { path: "salida-confirmada",   label: "✅ Salidas Confirmadas",        perm: "ver_reportes_actividad" },
  { path: "reportes-actividad",  label: "📝 Reportes de Actividad",     perm: "ver_reportes_actividad" },
];

export default function PanelAdmin() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  // Mostrar solo los links que el usuario tiene permiso
  const visibles = links.filter(l =>
    !l.perm || (user?.permisos || []).includes(l.perm)
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-red-700">🛡️ Panel Admin</h1>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{user?.nombre}</p>
        </div>

        <nav className="flex flex-col space-y-1 p-2 flex-1 overflow-y-auto">
          {visibles.map((link) => (
            <div key={link.path}>
              {link.divider && <div className="my-2 border-t border-gray-200" />}
              <NavLink
                to={`/admin/${link.path}`}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                    isActive
                      ? "bg-red-100 text-red-700"
                      : "hover:bg-red-50 text-gray-700"
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
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
