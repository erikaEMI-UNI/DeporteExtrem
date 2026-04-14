import { useState, useEffect } from "react";

const API = "/api";
const authH = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});

function fmtFecha(f) {
  if (!f) return "—";
  return new Date(f).toLocaleDateString("es-BO", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtHora(f) {
  if (!f) return "";
  return new Date(f).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
}

export default function SalidaConfirmada() {
  const [salidas, setSalidas]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [busqueda, setBusqueda]   = useState("");
  const [expandido, setExpandido] = useState(null);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/reportes-actividad`, { headers: authH() });
      if (!res.ok) throw new Error("Error al cargar reportes");
      const data = await res.json();
      // Solo pre-salidas enviadas
      const preSalidas = data.filter(r => r.tipo === "pre_salida" && r.estado === "enviado");
      setSalidas(preSalidas);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filtradas = salidas.filter(s => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      s.actividad?.nombre?.toLowerCase().includes(q) ||
      s.operador?.nombre?.toLowerCase().includes(q)
    );
  });

  // Stats
  const totalSalidas     = salidas.length;
  const todosPresentes   = salidas.filter(s => s.todosPresentes).length;
  const conAusentes      = salidas.filter(s => !s.todosPresentes).length;
  const totalParticipantes = salidas.reduce((acc, s) => acc + (s.participantesPresentes?.length || 0), 0);
  const totalPresentes     = salidas.reduce((acc, s) =>
    acc + (s.participantesPresentes?.filter(p => p.presente).length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">✅ Salidas Confirmadas</h2>
          <p className="text-sm text-gray-500 mt-0.5">Listas pre-salida enviadas por los operadores</p>
        </div>
        <button
          onClick={cargar}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
        >
          ↺ Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Salidas",           value: totalSalidas,     color: "bg-blue-100 text-blue-700" },
          { label: "Todos presentes",   value: todosPresentes,   color: "bg-green-100 text-green-700" },
          { label: "Con ausentes",      value: conAusentes,      color: "bg-yellow-100 text-yellow-700" },
          { label: "Asistencia",
            value: totalParticipantes > 0
              ? `${totalPresentes}/${totalParticipantes}`
              : "—",
            color: "bg-purple-100 text-purple-700" },
        ].map(c => (
          <div key={c.label} className={`${c.color} rounded-xl p-4 text-center`}>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-xs font-medium mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar actividad u operador…"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
      />

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto" />
          <p className="text-gray-500 mt-3 text-sm">Cargando salidas…</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">🚩</p>
          <p className="text-sm">No hay salidas confirmadas aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map(s => {
            const presentes = (s.participantesPresentes || []).filter(p => p.presente).length;
            const total     = (s.participantesPresentes || []).length;
            const pct       = total > 0 ? Math.round((presentes / total) * 100) : 0;
            const isOpen    = expandido === s._id;

            return (
              <div
                key={s._id}
                className={`bg-white rounded-2xl shadow-sm border transition-all ${
                  s.todosPresentes ? "border-green-200" : "border-yellow-200"
                }`}
              >
                {/* Cabecera de la tarjeta */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
                  onClick={() => setExpandido(isOpen ? null : s._id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Icono estado */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${
                      s.todosPresentes ? "bg-green-100" : "bg-yellow-100"
                    }`}>
                      {s.todosPresentes ? "✅" : "⚠️"}
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 truncate">{s.actividad?.nombre || "—"}</p>
                      <p className="text-xs text-gray-500">
                        {fmtFecha(s.fechaActividad)} · Operador: {s.operador?.nombre || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    {/* Barra de progreso */}
                    <div className="hidden sm:block w-28">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{presentes}/{total}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct === 100 ? "bg-green-500" : pct >= 50 ? "bg-yellow-400" : "bg-red-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Hora de envío */}
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-gray-400">Enviado</p>
                      <p className="text-xs font-medium text-gray-600">{fmtHora(s.fechaEnvio)}</p>
                    </div>

                    {/* Chevron */}
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Panel expandido — lista de participantes */}
                {isOpen && (
                  <div className="border-t border-gray-100 px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-gray-700">
                        👥 Participantes ({presentes}/{total} presentes)
                      </p>
                      {s.observaciones && (
                        <p className="text-xs text-gray-500 max-w-xs truncate">
                          💬 {s.observaciones}
                        </p>
                      )}
                    </div>

                    {total === 0 ? (
                      <p className="text-sm text-gray-400 italic">Sin participantes registrados</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {s.participantesPresentes.map((p, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${
                              p.presente
                                ? "bg-green-50 border border-green-200 text-green-800"
                                : "bg-red-50  border border-red-200  text-red-800"
                            }`}
                          >
                            <span className="text-base flex-shrink-0">
                              {p.presente ? "✅" : "❌"}
                            </span>
                            <span className="font-medium truncate">{p.nombre}</span>
                            <span className="ml-auto text-xs opacity-70 flex-shrink-0">
                              {p.presente ? "Presente" : "Ausente"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
                      <span>📅 Actividad: {fmtFecha(s.fechaActividad)}</span>
                      {s.fechaEnvio && <span>📤 Enviado: {fmtFecha(s.fechaEnvio)} {fmtHora(s.fechaEnvio)}</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
