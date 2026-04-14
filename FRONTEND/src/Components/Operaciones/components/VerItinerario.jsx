import { useState, useEffect } from "react";

const API = "/api";
const authH = () => ({
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});

const TIPO_CONFIG = {
  inicio:     { emoji: "🚩", label: "Inicio",      bg: "bg-green-50",  border: "border-green-200",  dot: "bg-green-500",  text: "text-green-700"  },
  transporte: { emoji: "🚐", label: "Transporte",  bg: "bg-blue-50",   border: "border-blue-200",   dot: "bg-blue-500",   text: "text-blue-700"   },
  actividad:  { emoji: "⚡", label: "Actividad",   bg: "bg-red-50",    border: "border-red-200",    dot: "bg-red-500",    text: "text-red-700"    },
  descanso:   { emoji: "☕", label: "Descanso",    bg: "bg-amber-50",  border: "border-amber-200",  dot: "bg-amber-500",  text: "text-amber-700"  },
  comida:     { emoji: "🍽️", label: "Comida",      bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500", text: "text-orange-700" },
  fin:        { emoji: "🏁", label: "Fin",         bg: "bg-purple-50", border: "border-purple-200", dot: "bg-purple-500", text: "text-purple-700" },
  otro:       { emoji: "📌", label: "Paso",        bg: "bg-gray-50",   border: "border-gray-200",   dot: "bg-gray-400",   text: "text-gray-700"   },
};

export default function VerItinerario() {
  const [actividades, setActividades] = useState([]);
  const [actividadId, setActividadId] = useState("");
  const [pasos, setPasos]             = useState([]);
  const [loadingActs, setLoadingActs] = useState(true);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  /* --- cargar actividades --- */
  useEffect(() => {
    fetch(`${API}/actividades`, { headers: authH() })
      .then(r => r.json())
      .then(data => {
        const lista = Array.isArray(data) ? data : data.actividades || data.data || [];
        setActividades(lista);
      })
      .catch(() => setError("No se pudieron cargar las actividades"))
      .finally(() => setLoadingActs(false));
  }, []);

  /* --- cargar pasos al cambiar actividad --- */
  useEffect(() => {
    if (!actividadId) { setPasos([]); return; }
    setLoading(true);
    setError("");
    fetch(`${API}/pasos-itinerario?actividad=${actividadId}`)
      .then(r => r.json())
      .then(data => setPasos(Array.isArray(data) ? data : []))
      .catch(() => setError("No se pudo cargar el itinerario"))
      .finally(() => setLoading(false));
  }, [actividadId]);

  const actividadActual = actividades.find(a => a._id === actividadId);

  /* Duración total estimada a partir de hora del primer y último paso */
  const horaInicio = pasos.find(p => p.hora)?.hora;
  const horaFin    = [...pasos].reverse().find(p => p.hora)?.hora;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">🗺️ Itinerario de Actividad</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Consulta el programa paso a paso antes de la salida
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{error}</div>
      )}

      {/* Selector de actividad */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Selecciona una actividad
        </label>
        {loadingActs ? (
          <p className="text-sm text-gray-400">Cargando actividades…</p>
        ) : (
          <select
            value={actividadId}
            onChange={e => setActividadId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="">— Elegir actividad —</option>
            {actividades.map(a => (
              <option key={a._id} value={a._id}>{a.nombre}</option>
            ))}
          </select>
        )}
      </div>

      {/* Timeline de pasos */}
      {actividadId && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Cabecera */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
            <h3 className="font-bold text-gray-800 text-lg">
              {actividadActual?.nombre || "Actividad"}
            </h3>
            {horaInicio && horaFin && horaInicio !== horaFin && (
              <p className="text-xs text-gray-500 mt-0.5">
                🕐 {horaInicio} → {horaFin} · {pasos.length} {pasos.length === 1 ? "paso" : "pasos"}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
          ) : pasos.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-2">🗺️</p>
              <p className="text-sm">Esta actividad aún no tiene itinerario definido.</p>
              <p className="text-xs mt-1 text-gray-300">Contacta al administrador para agregarlo.</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Resumen rápido */}
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(
                  pasos.reduce((acc, p) => {
                    acc[p.tipo] = (acc[p.tipo] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([tipo, count]) => {
                  const cfg = TIPO_CONFIG[tipo] || TIPO_CONFIG.otro;
                  return (
                    <span
                      key={tipo}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.border} ${cfg.text}`}
                    >
                      {cfg.emoji} {cfg.label}: {count}
                    </span>
                  );
                })}
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-4">
                  {pasos.map((paso, idx) => {
                    const cfg = TIPO_CONFIG[paso.tipo] || TIPO_CONFIG.otro;
                    return (
                      <div key={paso._id} className="relative flex gap-4 pl-12">
                        {/* Número + dot */}
                        <div
                          className={`absolute left-3 top-3 w-4 h-4 rounded-full border-2 border-white ring-2 ring-offset-0 flex items-center justify-center ${cfg.dot}`}
                          style={{ transform: "translateX(-50%)" }}
                        >
                          <span className="text-white text-[8px] font-bold leading-none">{idx + 1}</span>
                        </div>

                        {/* Tarjeta */}
                        <div className={`flex-1 rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <span className={`font-bold text-sm flex items-center gap-1.5 ${cfg.text}`}>
                              <span className="text-base">{cfg.emoji}</span>
                              {paso.titulo}
                            </span>
                            <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                              {paso.hora && (
                                <span className="font-semibold text-gray-700 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                                  🕐 {paso.hora}
                                </span>
                              )}
                              {paso.duracion && (
                                <span>⏱ {paso.duracion}</span>
                              )}
                            </div>
                          </div>

                          {paso.descripcion && (
                            <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                              {paso.descripcion}
                            </p>
                          )}

                          {paso.ubicacion?.nombre && (
                            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                              📍 {paso.ubicacion.nombre}
                            </p>
                          )}

                          {paso.notas && (
                            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs text-amber-700">
                              💡 <strong>Nota:</strong> {paso.notas}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
