import { NavLink, Outlet } from 'react-router-dom';
import { useEffect } from 'react';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/usuarios', label: 'Usuarios' },
  { to: '/admin/actividades', label: 'Actividades' },
  { to: '/admin/multimedia', label: 'Multimedia' },
  { to: '/admin/reportes', label: 'Reportes' },
  { to: '/admin/bitacora', label: 'Bitácora' },
];

export default function AdminLayout() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 text-2xl font-bold text-red-700">Admin</div>
        <nav className="flex flex-col space-y-1 p-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md font-medium transition-colors ${
                  isActive ? 'bg-red-100 text-red-700' : 'hover:bg-red-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-4 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

