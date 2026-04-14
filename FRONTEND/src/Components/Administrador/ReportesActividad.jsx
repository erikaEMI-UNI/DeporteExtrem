import { useState, useEffect } from "react";

const API = "/api";
const authH = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});

const TIPO_LABEL = {
  pre_salida:     "Pre-salida",
  post_actividad: "Post-actividad",
};

const TIPO_COLOR = {
  pre_salida:     "bg-blue-100 text-blue-700",
  post_actividad: "bg-purple-100 text-purple-700",
};

function fmtFecha(f) {
  if (!f) return "—";
  return new Date(f).toLocaleDateString("es-BO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtHora(f) {
  if (!f) return "";
  return new Date(f).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
}

export default function ReportesActividad() {
  const [reportes, setReportes]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [detalle, setDetalle]     = useState(null);   // reporte abierto en modal
  const [filtroTipo, setFiltroTipo]   = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda]   = useState("");

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/reportes-actividad`, { headers: authH() });
      if (!res.ok) throw new Error("Error al cargar reportes");
      const data = await res.json();
      setReportes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reportesFiltrados = reportes.filter(r => {
    if (filtroTipo   !== "todos" && r.tipo   !== filtroTipo)   return false;
    if (filtroEstado !== "todos" && r.estado !== filtroEstado) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      const enActividad = r.actividad?.nombre?.toLowerCase().includes(q);
      const enOperador  = r.operador?.nombre?.toLowerCase().includes(q);
      if (!enActividad && !enOperador) return false;
    }
    return true;
  });

  const incidentes  = reportes.filter(r => r.huboIncidente).length;
  const enviados    = reportes.filter(r => r.estado === "enviado").length;
  const borradores  = reportes.filter(r => r.estado === "borrador").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📝 Reportes de Actividad</h2>
          <p className="text-sm text-gray-500 mt-0.5">Reportes enviados por operadores</p>
        </div>
        <button
          onClick={cargar}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
        >
          ↺ Actualizar
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",       value: reportes.length,  color: "bg-gray-100 text-gray-700" },
          { label: "Enviados",    value: enviados,          color: "bg-green-100 text-green-700" },
          { label: "Borradores",  value: borradores,        color: "bg-yellow-100 text-yellow-700" },
          { label: "Incidentes",  value: incidentes,        color: "bg-red-100 text-red-700" },
        ].map(c => (
          <div key={c.label} className={`${c.color} rounded-xl p-4 text-center`}>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-xs font-medium mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar actividad u operador…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <select
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <option value="todos">Todos los tipos</option>
          <option value="pre_salida">Pre-salida</option>
          <option value="post_actividad">Post-actividad</option>
        </select>
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <option value="todos">Todos los estados</option>
          <option value="enviado">Enviados</option>
          <option value="borrador">Borradores</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto" />
          <p className="text-gray-500 mt-3 text-sm">Cargando reportes…</p>
        </div>
      ) : reportesFiltrados.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📂</p>
          <p className="text-sm">No hay reportes que coincidan con los filtros</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Actividad</th>
                <th className="px-4 py-3 text-left">Operador</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Prioridad</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportesFiltrados.map(r => (
                <tr
                  key={r._id}
                  className={`hover:bg-gray-50 transition ${r.huboIncidente ? "bg-red-50/40" : ""}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {r.actividad?.nombre || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.operador?.nombre || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIPO_COLOR[r.tipo] || "bg-gray-100 text-gray-600"}`}>
                      {TIPO_LABEL[r.tipo] || r.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {fmtFecha(r.fechaActividad)}
                  </td>
                  <td className="px-4 py-3">
                    {r.estado === "enviado" ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        ✅ Enviado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        ✏️ Borrador
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.huboIncidente ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">
                        🚨 Incidente
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setDetalle(r)}
                      className="text-red-600 hover:text-red-800 font-medium text-xs underline"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalle */}
      {detalle && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setDetalle(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className={`px-6 py-4 rounded-t-2xl flex items-center justify-between ${detalle.huboIncidente ? "bg-red-600" : "bg-gradient-to-r from-red-600 to-red-700"}`}>
              <div>
                <h3 className="text-white font-bold text-lg">
                  {detalle.huboIncidente ? "🚨 Reporte con Incidente" : "📝 Reporte de Actividad"}
                </h3>
                <p className="text-white/80 text-sm">{detalle.actividad?.nombre}</p>
              </div>
              <button
                onClick={() => setDetalle(null)}
                className="text-white/80 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Info general */}
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Operador"     value={detalle.operador?.nombre} />
                <InfoField label="Actividad"    value={detalle.actividad?.nombre} />
                <InfoField label="Fecha"        value={fmtFecha(detalle.fechaActividad)} />
                <InfoField label="Tipo"         value={TIPO_LABEL[detalle.tipo] || detalle.tipo} />
                <InfoField label="Estado"       value={detalle.estado === "enviado" ? "✅ Enviado" : "✏️ Borrador"} />
                {detalle.fechaEnvio && (
                  <InfoField label="Enviado el" value={`${fmtFecha(detalle.fechaEnvio)} ${fmtHora(detalle.fechaEnvio)}`} />
                )}
              </div>

              {/* Pre-salida: participantes */}
              {detalle.tipo === "pre_salida" && detalle.participantesPresentes?.length > 0 && (
                <Section title="👥 Control de participantes">
                  <div className="grid grid-cols-2 gap-2">
                    {detalle.participantesPresentes.map((p, i) => (
                      <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${p.presente ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        <span>{p.presente ? "✅" : "❌"}</span>
                        <span>{p.nombre}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Presentes: {detalle.participantesPresentes.filter(p => p.presente).length} / {detalle.participantesPresentes.length}
                    {detalle.todosPresentes && " — Todos presentes ✅"}
                  </p>
                </Section>
              )}

              {/* Post-actividad: checklist */}
              {detalle.tipo === "post_actividad" && (
                <Section title="✔️ Checklist post-actividad">
                  <div className="space-y-2">
                    <CheckRow label="Todos los participantes regresaron" value={detalle.participantesCompletos} />
                    <CheckRow label="Equipos completos y en buen estado"  value={detalle.equiposCompletos} />
                  </div>
                </Section>
              )}

              {/* Incidente */}
              {detalle.huboIncidente && (
                <Section title="🚨 Detalle del incidente" className="border border-red-200 bg-red-50 rounded-xl p-4">
                  <div className="space-y-3">
                    {detalle.incidente?.descripcion && (
                      <div>
                        <p className="text-xs font-semibold text-red-700 uppercase mb-1">Descripción</p>
                        <p className="text-sm text-gray-800">{detalle.incidente.descripcion}</p>
                      </div>
                    )}
                    {detalle.incidente?.participanteAfectado && (
                      <InfoField label="Participante afectado" value={detalle.incidente.participanteAfectado} />
                    )}
                    {detalle.incidente?.momento && (
                      <InfoField label="Momento" value={detalle.incidente.momento} />
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-red-700 uppercase">Atención médica:</span>
                      <span className={`text-xs font-bold ${detalle.incidente?.atencionMedica ? "text-red-700" : "text-gray-600"}`}>
                        {detalle.incidente?.atencionMedica ? "Sí" : "No"}
                      </span>
                    </div>
                    {detalle.incidente?.atencionMedica && detalle.incidente?.atencionMedicaDetalle && (
                      <div>
                        <p className="text-xs font-semibold text-red-700 uppercase mb-1">Detalle médico</p>
                        <p className="text-sm text-gray-800">{detalle.incidente.atencionMedicaDetalle}</p>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Observaciones */}
              {detalle.observaciones && (
                <Section title="💬 Observaciones">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{detalle.observaciones}</p>
                </Section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componentes auxiliares del modal
function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value || "—"}</p>
    </div>
  );
}

function Section({ title, children, className = "" }) {
  return (
    <div className={className}>
      <p className="text-sm font-bold text-gray-700 mb-2">{title}</p>
      {children}
    </div>
  );
}

function CheckRow({ label, value }) {
  if (value === null || value === undefined) return null;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${value ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
      <span>{value ? "✅" : "❌"}</span>
      <span>{label}</span>
    </div>
  );
}
