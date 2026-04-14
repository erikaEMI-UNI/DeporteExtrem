import { useState, useEffect } from "react";

const TIPO_CONFIG = {
  inicio:     { emoji: "🚩", label: "Inicio",      bg: "bg-green-100",  border: "border-green-300",  dot: "bg-green-500"  },
  transporte: { emoji: "🚐", label: "Transporte",  bg: "bg-blue-100",   border: "border-blue-300",   dot: "bg-blue-500"   },
  actividad:  { emoji: "⚡", label: "Actividad",   bg: "bg-red-100",    border: "border-red-300",    dot: "bg-red-500"    },
  descanso:   { emoji: "☕", label: "Descanso",    bg: "bg-amber-100",  border: "border-amber-300",  dot: "bg-amber-500"  },
  comida:     { emoji: "🍽️", label: "Comida",      bg: "bg-orange-100", border: "border-orange-300", dot: "bg-orange-500" },
  fin:        { emoji: "🏁", label: "Fin",         bg: "bg-purple-100", border: "border-purple-300", dot: "bg-purple-500" },
  otro:       { emoji: "📌", label: "Paso",        bg: "bg-gray-100",   border: "border-gray-300",   dot: "bg-gray-400"   },
};

/**
 * TimelineItinerario
 * Muestra la lista ordenada de pasos de itinerario de una actividad.
 * Props: actividadId (string)
 */
export default function TimelineItinerario({ actividadId }) {
  const [pasos, setPasos]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!actividadId) return;
    setLoading(true);

    fetch(`/api/pasos-itinerario?actividad=${actividadId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPasos(data);
        else setPasos([]);
      })
      .catch(() => setError("No se pudo cargar el itinerario"))
      .finally(() => setLoading(false));
  }, [actividadId]);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500" />
      </div>
    );
  }

  if (error || pasos.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        🗺️ Programa del día
      </h4>

      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-4">
          {pasos.map((paso, idx) => {
            const cfg = TIPO_CONFIG[paso.tipo] || TIPO_CONFIG.otro;
            const isLast = idx === pasos.length - 1;

            return (
              <div key={paso._id} className="relative flex gap-4 pl-12">
                {/* Dot en la línea */}
                <div
                  className={`absolute left-3.5 top-3 w-3 h-3 rounded-full border-2 border-white ring-2 ring-offset-0 ${cfg.dot}`}
                  style={{ transform: "translateX(-50%)" }}
                />

                {/* Tarjeta del paso */}
                <div
                  className={`flex-1 rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}
                >
                  {/* Header: tipo + hora */}
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                    <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      <span className="text-base">{cfg.emoji}</span>
                      {paso.titulo}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {paso.hora && (
                        <span className="font-semibold text-gray-700">🕐 {paso.hora}</span>
                      )}
                      {paso.duracion && (
                        <span>⏱ {paso.duracion}</span>
                      )}
                    </div>
                  </div>

                  {/* Descripción */}
                  {paso.descripcion && (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {paso.descripcion}
                    </p>
                  )}

                  {/* Ubicación */}
                  {paso.ubicacion?.nombre && (
                    <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                      📍 {paso.ubicacion.nombre}
                    </p>
                  )}

                  {/* Notas */}
                  {paso.notas && (
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1 border border-amber-200">
                      💡 {paso.notas}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
