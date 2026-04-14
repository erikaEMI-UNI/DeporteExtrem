"use client";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const UserProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Determinar el panel principal según el rol
  const panelPrincipal = () => {
    if (!user?.roles) return null;
    const roles = user.roles.map(r => (typeof r === "object" ? r.nombre : r));
    if (roles.includes("admin"))    return { label: "Panel Administrador", path: "/admin",       color: "from-red-600 to-red-700",       icon: "🛡️" };
    if (roles.includes("operador")) return { label: "Panel de Operaciones", path: "/operaciones", color: "from-orange-500 to-amber-600",   icon: "⚙️" };
    if (roles.includes("turista"))  return { label: "Mis Reservas",         path: "/reservas",    color: "from-emerald-500 to-teal-600",  icon: "🎯" };
    return null;
  };
  const panel = panelPrincipal();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-red-100">
          <div className="animate-pulse space-y-4">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full mx-auto"></div>
            <div className="h-4 bg-red-100 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-orange-100 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30",
      operador: "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30",
      turista: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30",
    };
    return colors[role] || "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-red-100">
          {/* Banner superior con gradiente rojo-naranja */}
          <div className="h-32 bg-gradient-to-r from-red-600 via-red-700 to-orange-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/5"></div>
            {/* Patrón decorativo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-32 h-32 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 border-2 border-white rounded-full"></div>
            </div>
          </div>

          <div className="relative px-6 sm:px-8 pb-8">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row sm:items-end -mt-16 mb-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-br from-red-600 via-red-700 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white">
                  <span className="text-4xl font-bold text-white">
                    {getInitials(user.nombre)}
                  </span>
                </div>
                {user.activo && (
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg">
                    <svg className="w-full h-full p-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                  {user.nombre}
                </h1>
                <p className="text-gray-600 text-lg mb-3">{user.email}</p>

                {/* Roles, VIP y estado */}
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {user.roles && user.roles.length > 0 && user.roles.map((rol, index) => {
                    const roleName = typeof rol === "object" ? rol.nombre : rol;
                    return (
                      <span
                        key={index}
                        className={`inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-semibold ${getRoleColor(roleName)}`}
                      >
                        {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
                      </span>
                    );
                  })}

                  {/* Badge VIP — solo para turistas */}
                  {user.roles?.some(r => (typeof r === "object" ? r.nombre : r) === "turista") && (
                    user.esVip ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-400/30">
                        ⭐ VIP
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                        ☆ Normal
                      </span>
                    )
                  )}

                  <span className={`inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-semibold ${
                    user.activo
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {user.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón acceso rápido al panel por rol */}
            {panel && (
              <div className="mt-6">
                <button
                  onClick={() => navigate(panel.path)}
                  className={`w-full sm:w-auto inline-flex items-center gap-3 px-6 py-3 rounded-xl text-white font-bold text-base shadow-lg bg-gradient-to-r ${panel.color} hover:opacity-90 transition-all duration-200`}
                >
                  <span className="text-xl">{panel.icon}</span>
                  {panel.label}
                  <svg className="w-5 h-5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            )}

            {/* Stats rápidos con colores complementarios */}
            {(() => {
              const esTurista = user.roles?.some(r => (typeof r === "object" ? r.nombre : r) === "turista");
              return (
            <div className={`grid grid-cols-1 sm:grid-cols-${esTurista ? "3" : "2"} gap-4 mt-8 pt-8 border-t border-red-100`}>
              {esTurista && (
              <StatCard
                label="Membresía"
                value={user.esVip ? "VIP ⭐" : "Normal"}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                }
                color={user.esVip ? "text-yellow-600 bg-yellow-50" : "text-red-600 bg-red-50"}
                gradient={user.esVip ? "from-yellow-400 to-amber-500" : "from-red-500 to-orange-500"}
              />
              )}
              <StatCard
                label="Roles"
                value={user.roles?.length || 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                color="text-orange-600 bg-orange-50"
                gradient="from-orange-500 to-amber-500"
              />
              <StatCard
                label="Días activo"
                value={user.createdAt ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                color="text-amber-600 bg-amber-50"
                gradient="from-amber-500 to-yellow-500"
              />
            </div>
              );
            })()}
          </div>
        </div>

        {/* Grid de contenido */}
        {(() => {
          const esTurista = user.roles?.some(r => (typeof r === "object" ? r.nombre : r) === "turista");
          return (
        <div className={`grid grid-cols-1 ${esTurista ? "lg:grid-cols-3" : ""} gap-6`}>
          {/* Información Personal */}
          <div className={`${esTurista ? "lg:col-span-2" : ""} space-y-6`}>
            <Section title="Información Personal" icon="👤" gradient="from-red-500 to-orange-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Nombre Completo" value={user.nombre} />
                <InfoField label="Correo Electrónico" value={user.email} />
                <InfoField label="Cédula de Identidad" value={user.ci} />
                <InfoField label="Teléfono" value={user.celular} />
              </div>
            </Section>

            <Section title="Actividad de la Cuenta" icon="📊" gradient="from-orange-500 to-amber-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Último Acceso
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm">
                      {user.ultimoLogin
                        ? new Date(user.ultimoLogin).toLocaleString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "No disponible"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Miembro Desde
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="text-sm">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "No disponible"}
                    </span>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* Membresía — solo turistas */}
          {esTurista && (
          <div>
            <Section
              title="Membresía"
              icon={user.esVip ? "⭐" : "👤"}
              gradient={user.esVip ? "from-yellow-400 to-amber-500" : "from-gray-400 to-gray-500"}
            >
              {user.esVip ? (
                <div className="flex flex-col items-center text-center py-6 gap-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center shadow-lg">
                    <span className="text-5xl">⭐</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-yellow-700">Usuario VIP</p>
                    <p className="text-sm text-yellow-600 mt-1">Tienes acceso a contenido exclusivo</p>
                  </div>
                  <div className="w-full mt-2 space-y-2">
                    <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                      <span className="text-yellow-500 text-lg">👁️</span>
                      <p className="text-sm font-medium text-yellow-800">Ver actividades inactivas</p>
                    </div>
                    <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                      <span className="text-yellow-500 text-lg">🎯</span>
                      <p className="text-sm font-medium text-yellow-800">Acceso prioritario a reservas</p>
                    </div>
                    <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                      <span className="text-yellow-500 text-lg">🏆</span>
                      <p className="text-sm font-medium text-yellow-800">Beneficios y descuentos exclusivos</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-6 gap-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-md border-2 border-gray-200">
                    <span className="text-5xl">☆</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-600">Usuario Normal</p>
                    <p className="text-sm text-gray-500 mt-1">Disfruta de las actividades disponibles</p>
                  </div>
                  <div className="w-full mt-2 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-yellow-700 mb-1">¿Quieres ser VIP? ⭐</p>
                    <p className="text-xs text-yellow-600">Contacta con un administrador para obtener acceso VIP y desbloquear beneficios exclusivos.</p>
                  </div>
                </div>
              )}
            </Section>
          </div>
          )}
        </div>
          );
        })()}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fef2f2;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #dc2626, #f97316);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #b91c1c, #ea580c);
        }
      `}</style>
    </div>
  );
};

// Componentes auxiliares
const Section = ({ title, icon, children, badge, gradient }) => (
  <div className="bg-white rounded-xl shadow-md border border-red-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div className={`bg-gradient-to-r ${gradient} px-6 py-4 border-b border-red-100`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h2>
        {badge !== undefined && (
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/30">
            {badge}
          </span>
        )}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const StatCard = ({ label, value, icon, color, gradient }) => (
  <div className="flex items-center gap-4 group">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className="relative z-10">
        {icon}
      </div>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const InfoField = ({ label, value }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-lg px-4 py-3 hover:border-red-300 hover:from-red-100 hover:to-orange-100 transition-all duration-150">
      <p className="text-gray-900 font-medium">{value}</p>
    </div>
  </div>
);

export default UserProfilePage;