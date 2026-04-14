import { useState, useEffect, useCallback } from "react";

const API = "/api";
const authH = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});
const fetchJSON = async (url, opts = {}) => {
  const res = await fetch(url, { headers: authH(), ...opts });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.mensaje || "Error");
  return data;
};

const TIPO_CONFIG = {
  inicio:      { emoji: "🚩", label: "Inicio",      color: "bg-green-100 text-green-700 border-green-200" },
  transporte:  { emoji: "🚐", label: "Transporte",  color: "bg-blue-100 text-blue-700 border-blue-200" },
  actividad:   { emoji: "⚡", label: "Actividad",   color: "bg-red-100 text-red-700 border-red-200" },
  descanso:    { emoji: "☕", label: "Descanso",    color: "bg-amber-100 text-amber-700 border-amber-200" },
  comida:      { emoji: "🍽️", label: "Comida",      color: "bg-orange-100 text-orange-700 border-orange-200" },
  fin:         { emoji: "🏁", label: "Fin",         color: "bg-purple-100 text-purple-700 border-purple-200" },
  otro:        { emoji: "📌", label: "Otro",        color: "bg-gray-100 text-gray-700 border-gray-200" },
};

const TIPOS = Object.entries(TIPO_CONFIG).map(([v, c]) => ({ value: v, ...c }));

const EMPTY_FORM = {
  titulo: "", descripcion: "", hora: "", duracion: "",
  tipo: "otro", ubicacionNombre: "", notas: "",
};

export default function ItinerarioActividad() {
  const [actividades, setActividades]   = useState([]);
  const [actividadId, setActividadId]   = useState("");
  const [pasos, setPasos]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [loadingActs, setLoadingActs]   = useState(true);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");

  // Modal de crear/editar
  const [modal, setModal]               = useState(false);
  const [editing, setEditing]           = useState(null); // null = crear
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);

  // Confirmación borrar
  const [deleting, setDeleting]         = useState(null);

  /* -------- cargar actividades -------- */
  useEffect(() => {
    fetchJSON(`${API}/actividades`)
      .then(data => {
        const lista = Array.isArray(data) ? data : data.actividades || data.data || [];
        setActividades(lista);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoadingActs(false));
  }, []);

  /* -------- cargar pasos -------- */
  const cargarPasos = useCallback(async (id) => {
    if (!id) { setPasos([]); return; }
    setLoading(true);
    setError("");
    try {
      const data = await fetchJSON(`${API}/pasos-itinerario?actividad=${id}`);
      setPasos(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarPasos(actividadId); }, [actividadId, cargarPasos]);

  /* -------- helpers UI -------- */
  const flash = (msg, isErr = false) => {
    if (isErr) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 3500);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, order: pasos.length });
    setModal(true);
  };

  const openEdit = (paso) => {
    setEditing(paso);
    setForm({
      titulo:           paso.titulo,
      descripcion:      paso.descripcion || "",
      hora:             paso.hora || "",
      duracion:         paso.duracion || "",
      tipo:             paso.tipo || "otro",
      ubicacionNombre:  paso.ubicacion?.nombre || "",
      notas:            paso.notas || "",
      order:            paso.order ?? 0,
    });
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditing(null); };

  /* -------- guardar -------- */
  const guardar = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) return flash("El título es obligatorio", true);
    setSaving(true);
    try {
      const body = {
        actividad:   actividadId,
        titulo:      form.titulo.trim(),
        descripcion: form.descripcion,
        hora:        form.hora,
        duracion:    form.duracion,
        tipo:        form.tipo,
        ubicacion:   { nombre: form.ubicacionNombre },
        order:       Number(form.order) || 0,
        notas:       form.notas,
      };

      if (editing) {
        await fetchJSON(`${API}/pasos-itinerario/${editing._id}`, {
          method: "PUT", body: JSON.stringify(body),
        });
        flash("Paso actualizado");
      } else {
        await fetchJSON(`${API}/pasos-itinerario`, {
          method: "POST", body: JSON.stringify(body),
        });
        flash("Paso creado");
      }
      closeModal();
      cargarPasos(actividadId);
    } catch (err) {
      flash(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  /* -------- eliminar -------- */
  const eliminar = async (id) => {
    try {
      await fetchJSON(`${API}/pasos-itinerario/${id}`, { method: "DELETE" });
      flash("Paso eliminado");
      setDeleting(null);
      cargarPasos(actividadId);
    } catch (err) {
      flash(err.message, true);
    }
  };

  /* -------- reordenar (flechas) -------- */
  const mover = async (index, dir) => {
    const arr = [...pasos];
    const swap = index + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[index], arr[swap]] = [arr[swap], arr[index]];
    const updated = arr.map((p, i) => ({ ...p, order: i }));
    setPasos(updated);
    try {
      await fetchJSON(`${API}/pasos-itinerario/reordenar`, {
        method: "PUT",
        body: JSON.stringify({ items: updated.map(p => ({ _id: p._id, order: p.order })) }),
      });
    } catch (err) {
      flash(err.message, true);
      cargarPasos(actividadId); // revert
    }
  };

  const actividadActual = actividades.find(a => a._id === actividadId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🗺️ Itinerario de Actividad</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Define los pasos del programa de cada actividad
          </p>
        </div>
        {actividadId && (
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition flex items-center gap-2"
          >
            + Agregar paso
          </button>
        )}
      </div>

      {/* Mensajes */}
      {error   && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 text-sm">{success}</div>}

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

      {/* Tabla / timeline de pasos */}
      {actividadId && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">
              {actividadActual?.nombre || "Actividad"}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({pasos.length} {pasos.length === 1 ? "paso" : "pasos"})
              </span>
            </h3>
            <button
              onClick={() => cargarPasos(actividadId)}
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              ↺ Actualizar
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
          ) : pasos.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="text-sm">No hay pasos todavía.</p>
              <button
                onClick={openCreate}
                className="mt-3 text-red-600 text-sm font-medium hover:underline"
              >
                + Agregar el primer paso
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pasos.map((paso, idx) => {
                const cfg = TIPO_CONFIG[paso.tipo] || TIPO_CONFIG.otro;
                return (
                  <div key={paso._id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition">
                    {/* Número de orden */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white text-sm font-bold flex items-center justify-center">
                      {idx + 1}
                    </div>

                    {/* Tipo badge + contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                          {cfg.emoji} {cfg.label}
                        </span>
                        {paso.hora && (
                          <span className="text-xs text-gray-500 font-medium">🕐 {paso.hora}</span>
                        )}
                        {paso.duracion && (
                          <span className="text-xs text-gray-400">⏱ {paso.duracion}</span>
                        )}
                        {paso.ubicacion?.nombre && (
                          <span className="text-xs text-gray-400">📍 {paso.ubicacion.nombre}</span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-800 text-sm">{paso.titulo}</p>
                      {paso.descripcion && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{paso.descripcion}</p>
                      )}
                      {paso.notas && (
                        <p className="text-xs text-amber-600 mt-0.5 italic">📝 {paso.notas}</p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex-shrink-0 flex items-center gap-1">
                      {/* Reordenar */}
                      <button
                        onClick={() => mover(idx, -1)}
                        disabled={idx === 0}
                        title="Subir"
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 transition"
                      >▲</button>
                      <button
                        onClick={() => mover(idx, 1)}
                        disabled={idx === pasos.length - 1}
                        title="Bajar"
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 transition"
                      >▼</button>

                      <button
                        onClick={() => openEdit(paso)}
                        className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition text-sm"
                        title="Editar"
                      >✏️</button>
                      <button
                        onClick={() => setDeleting(paso._id)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500 transition text-sm"
                        title="Eliminar"
                      >🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* -------- MODAL crear/editar -------- */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-lg">
                {editing ? "Editar paso" : "Nuevo paso"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            <form onSubmit={guardar} className="p-6 space-y-4">
              {/* Tipo */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de paso</label>
                <div className="flex flex-wrap gap-2">
                  {TIPOS.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, tipo: t.value }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        form.tipo === t.value ? t.color + " ring-2 ring-offset-1 ring-current" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Título */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Título *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ej: Punto de encuentro en plaza central"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Detalles del paso…"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>

              {/* Hora + Duración */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Hora</label>
                  <input
                    type="time"
                    value={form.hora}
                    onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Duración estimada</label>
                  <input
                    type="text"
                    value={form.duracion}
                    onChange={e => setForm(f => ({ ...f, duracion: e.target.value }))}
                    placeholder="Ej: 2 horas"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ubicación / Punto de referencia</label>
                <input
                  type="text"
                  value={form.ubicacionNombre}
                  onChange={e => setForm(f => ({ ...f, ubicacionNombre: e.target.value }))}
                  placeholder="Ej: Km 24 Camino a Los Yungas"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Posición (orden)</label>
                <input
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                  className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notas internas</label>
                <input
                  type="text"
                  value={form.notas}
                  onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                  placeholder="Ej: Traer agua y bloqueador"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-60"
                >
                  {saving ? "Guardando…" : editing ? "Actualizar" : "Crear paso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------- Confirmación eliminar -------- */}
      {deleting && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setDeleting(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-4xl mb-3">🗑️</p>
            <h3 className="font-bold text-gray-800 mb-2">¿Eliminar este paso?</h3>
            <p className="text-sm text-gray-500 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminar(deleting)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
