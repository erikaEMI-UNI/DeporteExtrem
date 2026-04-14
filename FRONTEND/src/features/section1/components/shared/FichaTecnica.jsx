/**
 * FichaTecnica
 * Muestra la ficha técnica estructurada de una actividad para el turista.
 * Props: fichaTecnica (objeto), recomendaciones (string)
 */

const DIFICULTAD_COLOR = {
  Principiante: "bg-green-100 text-green-700 border-green-300",
  Intermedio:   "bg-yellow-100 text-yellow-700 border-yellow-300",
  Avanzado:     "bg-orange-100 text-orange-700 border-orange-300",
  Experto:      "bg-red-100 text-red-700 border-red-300",
};

const InfoCard = ({ emoji, label, value }) => (
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-start gap-3">
    <span className="text-2xl flex-shrink-0">{emoji}</span>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-800 leading-snug">{value}</p>
    </div>
  </div>
);

export default function FichaTecnica({ fichaTecnica = {}, recomendaciones = "" }) {
  const {
    duracion, dificultad, altitud, clima,
    equipoNecesario = [], edadMinima, requisitosFisicos,
    temporada, incluye = [], noIncluye = [], puntoEncuentro,
  } = fichaTecnica;

  // ¿Hay algo que mostrar?
  const hasInfo = duracion || dificultad || altitud || clima || edadMinima != null ||
    temporada || puntoEncuentro || requisitosFisicos || recomendaciones ||
    equipoNecesario.length > 0 || incluye.length > 0 || noIncluye.length > 0;

  if (!hasInfo) return null;

  const infoCards = [
    duracion     && { emoji: "⏱️",  label: "Duración",      value: duracion },
    altitud      && { emoji: "⛰️",  label: "Altitud",       value: altitud },
    clima        && { emoji: "🌡️",  label: "Clima",         value: clima },
    temporada    && { emoji: "📅",  label: "Temporada",     value: temporada },
    edadMinima != null && { emoji: "👤", label: "Edad mínima", value: `${edadMinima} años` },
    puntoEncuentro && { emoji: "📍", label: "Punto de encuentro", value: puntoEncuentro },
  ].filter(Boolean);

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 space-y-6">
      <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        📋 Ficha Técnica
      </h4>

      {/* Dificultad destacada */}
      {dificultad && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">Nivel de dificultad:</span>
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${DIFICULTAD_COLOR[dificultad] || "bg-gray-100 text-gray-700 border-gray-300"}`}>
            {dificultad === "Principiante" && "🟢 "}
            {dificultad === "Intermedio"   && "🟡 "}
            {dificultad === "Avanzado"     && "🟠 "}
            {dificultad === "Experto"      && "🔴 "}
            {dificultad}
          </span>
        </div>
      )}

      {/* Grid de info cards */}
      {infoCards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {infoCards.map((c) => (
            <InfoCard key={c.label} emoji={c.emoji} label={c.label} value={c.value} />
          ))}
        </div>
      )}

      {/* Requisitos físicos */}
      {requisitosFisicos && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-bold text-blue-800 mb-1">💪 Requisitos físicos</p>
          <p className="text-sm text-blue-700 leading-relaxed">{requisitosFisicos}</p>
        </div>
      )}

      {/* Recomendaciones */}
      {recomendaciones && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-bold text-amber-800 mb-1">💡 Recomendaciones</p>
          <p className="text-sm text-amber-700 leading-relaxed">{recomendaciones}</p>
        </div>
      )}

      {/* Equipo necesario */}
      {equipoNecesario.length > 0 && (
        <div>
          <p className="text-sm font-bold text-gray-800 mb-2">🎒 Equipo necesario</p>
          <div className="flex flex-wrap gap-2">
            {equipoNecesario.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200 font-medium"
              >
                ✓ {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Incluye / No incluye */}
      {(incluye.length > 0 || noIncluye.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {incluye.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-bold text-green-800 mb-2">✅ Incluye</p>
              <ul className="space-y-1">
                {incluye.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                    <span className="text-green-500 flex-shrink-0 mt-0.5">●</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {noIncluye.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-bold text-red-800 mb-2">❌ No incluye</p>
              <ul className="space-y-1">
                {noIncluye.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                    <span className="text-red-400 flex-shrink-0 mt-0.5">●</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
