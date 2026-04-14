import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";

const API = "/api";
const authH = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});

const TIPO_ICONO = {
  incidente:          "🚨",
  confirmacion_salida:"✅",
  nueva_reserva:      "📋",
  cambio_reserva:     "✏️",
  cancelacion_reserva:"❌",
  general:            "🔔",
};

const TIPO_COLOR = {
  incidente:          "border-l-red-500 bg-red-50",
  confirmacion_salida:"border-l-green-500 bg-green-50",
  nueva_reserva:      "border-l-blue-500 bg-blue-50",
  cambio_reserva:     "border-l-amber-500 bg-amber-50",
  cancelacion_reserva:"border-l-gray-500 bg-gray-50",
  general:            "border-l-gray-400 bg-gray-50",
};

function tiempoRelativo(fecha) {
  const diff = Date.now() - new Date(fecha).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Ahora";
  if (m < 60) return `Hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  const d = Math.floor(h / 24);
  return `Hace ${d}d`;
}

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [notifs, setNotifs]       = useState([]);
  const [noLeidas, setNoLeidas]   = useState(0);
  const [open, setOpen]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const ref = useRef(null);

  const fetchNotifs = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`${API}/notificaciones`, { headers: authH() });
      if (!res.ok) return;
      const data = await res.json();
      setNotifs(data);
      setNoLeidas(data.filter(n => !n.leida).length);
    } catch {}
  }, [isAuthenticated]);

  // Cargar al montar y cada 5 segundos
  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, 5000);
    return () => clearInterval(id);
  }, [fetchNotifs]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const marcarLeida = async (id) => {
    setNotifs(prev => prev.map(n => n._id === id ? { ...n, leida: true } : n));
    setNoLeidas(prev => Math.max(0, prev - 1));
    await fetch(`${API}/notificaciones/${id}/leer`, { method: "PUT", headers: authH() });
  };

  const marcarTodasLeidas = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
    setNoLeidas(0);
    await fetch(`${API}/notificaciones/leer-todas`, { method: "PUT", headers: authH() });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={ref}>
      {/* Campana */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifs(); }}
        className="relative p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
        aria-label="Notificaciones"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a1 1 0 10-2 0v.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-600 to-red-700">
            <span className="text-white font-bold text-sm">
              🔔 Notificaciones {noLeidas > 0 && `(${noLeidas} nuevas)`}
            </span>
            {noLeidas > 0 && (
              <button
                onClick={marcarTodasLeidas}
                className="text-white/80 hover:text-white text-xs underline"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {notifs.length === 0 ? (
              <div className="px-4 py-10 text-center text-gray-400">
                <span className="text-3xl block mb-2">🔕</span>
                <p className="text-sm">Sin notificaciones</p>
              </div>
            ) : (
              notifs.map(n => (
                <div
                  key={n._id}
                  onClick={() => !n.leida && marcarLeida(n._id)}
                  className={`flex gap-3 px-4 py-3 border-l-4 cursor-pointer transition-all hover:brightness-95
                    ${TIPO_COLOR[n.tipo] || "border-l-gray-400 bg-white"}
                    ${!n.leida ? "opacity-100" : "opacity-60"}`}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{TIPO_ICONO[n.tipo] || "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold text-gray-800 leading-tight ${!n.leida ? "font-bold" : ""}`}>
                        {n.titulo}
                      </p>
                      {!n.leida && (
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.mensaje}</p>
                    <p className="text-xs text-gray-400 mt-1">{tiempoRelativo(n.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
