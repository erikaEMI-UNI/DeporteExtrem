import { useState, useEffect } from "react";

const API = "/api";
const authH = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});

const ESTADO_COLORS = {
  Pendiente:  "bg-yellow-100 text-yellow-700 border-yellow-200",
  Confirmada: "bg-green-100  text-green-700  border-green-200",
  Cancelada:  "bg-red-100    text-red-700    border-red-200",
  Completada: "bg-blue-100   text-blue-700   border-blue-200",
};

const ESTADO_OPCIONES = ["Pendiente", "Confirmada", "Cancelada", "Completada"];

function fmtFecha(f) {
  if (!f) return "—";
  return new Date(f).toLocaleDateString("es-BO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtMonto(n) {
  if (n == null) return "—";
  return `Bs. ${Number(n).toLocaleString("es-BO", { minimumFractionDigits: 2 })}`;
}

export default function ReservasAdmin() {
  const [reservas, setReservas]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [busqueda, setBusqueda]       = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [detalle, setDetalle]         = useState(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(null);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/reservas`, { headers: authH() });
      if (!res.ok) throw new Error("Error al cargar reservas");
      const data = await res.json();
      setReservas(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    setCambiandoEstado(id);
    try {
      const res = await fetch(`${API}/reservas/${id}`, {
        method: "PUT",
        headers: authH(),
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al actualizar");
      }
      setReservas(prev =>
        prev.map(r => r._id === id ? { ...r, estado: nuevoEstado } : r)
      );
      if (detalle?._id === id) setDetalle(prev => ({ ...prev, estado: nuevoEstado }));
    } catch (e) {
      setError(e.message);
    } finally {
      setCambiandoEstado(null);
    }
  };

  // Stats
  const total      = reservas.length;
  const pendientes = reservas.filter(r => r.estado === "Pendiente").length;
  const confirmadas= reservas.filter(r => r.estado === "Confirmada").length;
  const canceladas = reservas.filter(r => r.estado === "Cancelada").length;
  const ingresos   = reservas
    .filter(r => r.estado !== "Cancelada")
    .reduce((s, r) => s + (r.costoTotal || 0), 0);

  const filtradas = reservas.filter(r => {
    if (filtroEstado !== "todos" && r.estado !== filtroEstado) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      return (
        r.usuario?.nombre?.toLowerCase().includes(q) ||
        r.actividad?.nombre?.toLowerCase().includes(q) ||
        r.usuario?.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📋 Reservas</h2>
          <p className="text-sm text-gray-500 mt-0.5">Gestión de todas las reservas del sistema</p>
        </div>
        <button
          onClick={cargar}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
        >
          ↺ Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total",       value: total,       color: "bg-gray-100 text-gray-700" },
          { label: "Pendientes",  value: pendientes,  color: "bg-yellow-100 text-yellow-700" },
          { label: "Confirmadas", value: confirmadas, color: "bg-green-100 text-green-700" },
          { label: "Canceladas",  value: canceladas,  color: "bg-red-100 text-red-700" },
          { label: "Ingresos",    value: fmtMonto(ingresos), color: "bg-blue-100 text-blue-700" },
        ].map(c => (
          <div key={c.label} className={`${c.color} rounded-xl p-3 text-center`}>
            <p className="text-xl font-bold">{c.value}</p>
            <p className="text-xs font-medium mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por turista o actividad…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <option value="todos">Todos los estados</option>
          {ESTADO_OPCIONES.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto" />
          <p className="text-gray-500 mt-3 text-sm">Cargando reservas…</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-sm">No hay reservas con esos filtros</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Turista</th>
                <th className="px-4 py-3 text-left">Actividad</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Personas</th>
                <th className="px-4 py-3 text-left">Costo</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtradas.map(r => (
                <tr key={r._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{r.usuario?.nombre || "—"}</p>
                    <p className="text-xs text-gray-400">{r.usuario?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.actividad?.nombre || "—"}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtFecha(r.fechaActividad)}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{r.numeroPersonas}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{fmtMonto(r.costoTotal)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={r.estado}
                      disabled={cambiandoEstado === r._id}
                      onChange={e => cambiarEstado(r._id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${ESTADO_COLORS[r.estado] || "bg-gray-100 text-gray-600 border-gray-200"}`}
                    >
                      {ESTADO_OPCIONES.map(op => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
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

      {/* Modal detalle */}
      {detalle && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setDetalle(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-lg">📋 Detalle de Reserva</h3>
                <p className="text-white/70 text-xs mt-0.5">{detalle.actividad?.nombre}</p>
              </div>
              <button onClick={() => setDetalle(null)} className="text-white/80 hover:text-white text-2xl">×</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Info general */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Turista"      value={detalle.usuario?.nombre} />
                <Field label="Email"        value={detalle.usuario?.email} />
                <Field label="Actividad"    value={detalle.actividad?.nombre} />
                <Field label="Fecha"        value={fmtFecha(detalle.fechaActividad)} />
                <Field label="Tipo de tour" value={detalle.tipoTour} />
                <Field label="Categoría"    value={detalle.categoria} />
                <Field label="Nivel riesgo" value={detalle.nivelRiesgo} />
                <Field label="N° Personas"  value={detalle.numeroPersonas} />
                <Field label="Precio base"  value={fmtMonto(detalle.precioBase)} />
                <Field label="Costo total"  value={fmtMonto(detalle.costoTotal)} />
              </div>

              {/* Estado */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Estado</p>
                <select
                  value={detalle.estado}
                  disabled={cambiandoEstado === detalle._id}
                  onChange={e => cambiarEstado(detalle._id, e.target.value)}
                  className={`text-sm font-semibold px-3 py-1.5 rounded-lg border cursor-pointer focus:outline-none ${ESTADO_COLORS[detalle.estado] || "bg-gray-100"}`}
                >
                  {ESTADO_OPCIONES.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>

              {/* Participantes */}
              {detalle.participantes?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    👥 Participantes ({detalle.participantes.length})
                  </p>
                  <div className="space-y-2">
                    {detalle.participantes.map((p, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                        <p className="font-medium text-gray-800">{p.nombre}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {p.alergias   && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Alergias</span>}
                          {p.enfermedad && <span className="text-xs bg-red-100    text-red-700    px-2 py-0.5 rounded-full">Enfermedad</span>}
                          {p.medicamento&& <span className="text-xs bg-blue-100   text-blue-700   px-2 py-0.5 rounded-full">Medicamento</span>}
                          {!p.alergias && !p.enfermedad && !p.medicamento &&
                            <span className="text-xs text-gray-400">Sin condiciones</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ficha médica adjunta */}
              {detalle.fichaMedicaArchivo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className="text-blue-600">📄</span>
                  <span className="text-sm text-blue-700 font-medium">Ficha médica adjunta: {detalle.fichaMedicaArchivo}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value ?? "—"}</p>
    </div>
  );
}
