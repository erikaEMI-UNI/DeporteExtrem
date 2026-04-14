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

const DIFICULTADES = ["Principiante", "Intermedio", "Avanzado", "Experto"];

const EMPTY = {
  duracion: "", dificultad: "", altitud: "", clima: "",
  equipoNecesario: [], edadMinima: "", requisitosFisicos: "",
  categoria: "", temporada: "", incluye: [], noIncluye: [], puntoEncuentro: "",
};

/** Input de lista de strings (chips editables) */
function ListInput({ label, emoji, items, onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setDraft("");
  };

  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {emoji} {label}
      </label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
        >
          + Agregar
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs border border-gray-200"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-gray-400 hover:text-red-500 ml-0.5 leading-none"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FichaTecnicaAdmin() {
  const [actividades, setActividades]         = useState([]);
  const [actividadId, setActividadId]         = useState("");
  const [form, setForm]                       = useState(EMPTY);
  const [loadingActs, setLoadingActs]         = useState(true);
  const [loadingFicha, setLoadingFicha]       = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [error, setError]                     = useState("");
  const [success, setSuccess]                 = useState("");
  // Categorías
  const [todasCategorias, setTodasCategorias] = useState([]);
  const [catSeleccionadas, setCatSeleccionadas] = useState([]); // array de _id strings
  const [savingCats, setSavingCats]           = useState(false);

  /* ---- cargar actividades y categorías ---- */
  useEffect(() => {
    Promise.all([
      fetchJSON(`${API}/actividades`),
      fetchJSON(`${API}/categorias?todas=true`),
    ])
      .then(([dataActs, dataCats]) => {
        const lista = Array.isArray(dataActs) ? dataActs : dataActs.actividades || dataActs.data || [];
        setActividades(lista);
        setTodasCategorias(Array.isArray(dataCats) ? dataCats : []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoadingActs(false));
  }, []);

  /* ---- cargar ficha al cambiar actividad ---- */
  useEffect(() => {
    if (!actividadId) { setForm(EMPTY); setCatSeleccionadas([]); return; }
    setLoadingFicha(true);
    setError("");
    fetchJSON(`${API}/actividades/${actividadId}`)
      .then(data => {
        const ft = data.fichaTecnica || {};
        setForm({
          duracion:          ft.duracion          || "",
          dificultad:        ft.dificultad        || "",
          altitud:           ft.altitud           || "",
          clima:             ft.clima             || "",
          equipoNecesario:   ft.equipoNecesario   || [],
          edadMinima:        ft.edadMinima != null ? String(ft.edadMinima) : "",
          requisitosFisicos: ft.requisitosFisicos || "",
          categoria:         ft.categoria         || "",
          temporada:         ft.temporada         || "",
          incluye:           ft.incluye           || [],
          noIncluye:         ft.noIncluye         || [],
          puntoEncuentro:    ft.puntoEncuentro    || "",
        });
        // Cargar categorías ya asignadas a esta actividad
        const cats = (data.categorias || []).map(c =>
          typeof c === "object" ? c._id : c
        );
        setCatSeleccionadas(cats);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoadingFicha(false));
  }, [actividadId]);

  const flash = (msg, isErr = false) => {
    if (isErr) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 3500);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  /* ---- validar y guardar ---- */
  const guardar = async (e) => {
    e.preventDefault();
    if (!actividadId) return flash("Selecciona una actividad primero", true);

    // Validar edad
    if (form.edadMinima !== "" && form.edadMinima !== null) {
      const edad = Number(form.edadMinima);
      if (isNaN(edad) || edad < 0 || edad > 100) {
        return flash("La edad mínima debe ser un número entre 0 y 100", true);
      }
    }

    setSaving(true);
    try {
      await fetchJSON(`${API}/actividades/${actividadId}/ficha-tecnica`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          edadMinima: form.edadMinima !== "" ? Number(form.edadMinima) : null,
        }),
      });
      flash("✅ Ficha técnica guardada correctamente");
    } catch (err) {
      flash(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  /* ---- guardar categorías ---- */
  const guardarCategorias = async () => {
    if (!actividadId) return;
    setSavingCats(true);
    try {
      await fetchJSON(`${API}/categorias/actividad/${actividadId}/categorias`, {
        method: "PATCH",
        body: JSON.stringify({ categoriaIds: catSeleccionadas }),
      });
      flash("✅ Categorías guardadas");
    } catch (err) {
      flash(err.message, true);
    } finally {
      setSavingCats(false);
    }
  };

  const toggleCategoria = (id) => {
    setCatSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const actividadActual = actividades.find(a => a._id === actividadId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">📋 Ficha Técnica de Actividad</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Información estructurada que verá el turista al explorar cada actividad
        </p>
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

      {/* Formulario */}
      {actividadId && (
        <form onSubmit={guardar} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">
                {actividadActual?.nombre || "Actividad"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Completa los campos que correspondan</p>
            </div>
            {loadingFicha && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600" />
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* ── Información básica ── */}
            <section>
              <h4 className="text-sm font-bold text-gray-700 mb-3 pb-1 border-b border-gray-100">
                ℹ️ Información básica
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">⏱️ Duración</label>
                  <input
                    type="text"
                    value={form.duracion}
                    onChange={e => set("duracion", e.target.value)}
                    placeholder="Ej: Día completo (8-10 horas)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">🏷️ Categoría</label>
                  <input
                    type="text"
                    value={form.categoria}
                    onChange={e => set("categoria", e.target.value)}
                    placeholder="Ej: Rafting, Senderismo, Rappel"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">⛰️ Altitud</label>
                  <input
                    type="text"
                    value={form.altitud}
                    onChange={e => set("altitud", e.target.value)}
                    placeholder="Ej: 3.600 - 4.200 msnm"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">🌡️ Clima</label>
                  <input
                    type="text"
                    value={form.clima}
                    onChange={e => set("clima", e.target.value)}
                    placeholder="Ej: Frío, 5 - 15 °C"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">📅 Temporada</label>
                  <input
                    type="text"
                    value={form.temporada}
                    onChange={e => set("temporada", e.target.value)}
                    placeholder="Ej: Mayo - Octubre"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">📍 Punto de encuentro</label>
                  <input
                    type="text"
                    value={form.puntoEncuentro}
                    onChange={e => set("puntoEncuentro", e.target.value)}
                    placeholder="Ej: Plaza Mayor, La Paz"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>
            </section>

            {/* ── Dificultad y requisitos ── */}
            <section>
              <h4 className="text-sm font-bold text-gray-700 mb-3 pb-1 border-b border-gray-100">
                💪 Dificultad y requisitos
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">🎯 Dificultad</label>
                  <div className="flex gap-2 flex-wrap">
                    {DIFICULTADES.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => set("dificultad", form.dificultad === d ? "" : d)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                          form.dificultad === d
                            ? d === "Principiante" ? "bg-green-500 text-white border-green-500"
                            : d === "Intermedio"   ? "bg-yellow-500 text-white border-yellow-500"
                            : d === "Avanzado"     ? "bg-orange-500 text-white border-orange-500"
                            :                        "bg-red-500 text-white border-red-500"
                            : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {d === "Principiante" && "🟢 "}
                        {d === "Intermedio"   && "🟡 "}
                        {d === "Avanzado"     && "🟠 "}
                        {d === "Experto"      && "🔴 "}
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">👤 Edad mínima (años)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.edadMinima}
                    onChange={e => set("edadMinima", e.target.value)}
                    placeholder="Ej: 14"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">💪 Requisitos físicos</label>
                <textarea
                  value={form.requisitosFisicos}
                  onChange={e => set("requisitosFisicos", e.target.value)}
                  placeholder="Ej: Buena condición física general. Sin lesiones en rodillas o espalda. No apto para personas con vértigo severo."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>
            </section>

            {/* ── Categorías ── */}
            <section>
              <div className="flex items-center justify-between mb-3 pb-1 border-b border-gray-100">
                <h4 className="text-sm font-bold text-gray-700">🏷️ Categorías de actividad</h4>
                <button
                  type="button"
                  onClick={guardarCategorias}
                  disabled={savingCats}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition disabled:opacity-60"
                >
                  {savingCats ? "Guardando…" : "Guardar categorías"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Selecciona las categorías que aplican. Se usan para el filtro de la vista del turista.
              </p>
              {todasCategorias.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  No hay categorías creadas. Ve a la sección "Categorías" del panel para crear.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {todasCategorias.map(cat => {
                    const sel = catSeleccionadas.includes(cat._id);
                    return (
                      <button
                        key={cat._id}
                        type="button"
                        onClick={() => toggleCategoria(cat._id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                          sel
                            ? "bg-red-600 text-white border-red-600 shadow-sm"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-red-300"
                        }`}
                      >
                        <span>{cat.icono}</span>
                        {cat.nombre}
                        {sel && <span className="ml-0.5">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Equipo necesario ── */}
            <section>
              <h4 className="text-sm font-bold text-gray-700 mb-3 pb-1 border-b border-gray-100">
                🎒 Equipo y logística
              </h4>
              <ListInput
                label="Equipo necesario"
                emoji="🎒"
                items={form.equipoNecesario}
                onChange={v => set("equipoNecesario", v)}
                placeholder="Ej: Casco (Enter para agregar)"
              />
            </section>

            {/* ── Incluye / No incluye ── */}
            <section>
              <h4 className="text-sm font-bold text-gray-700 mb-3 pb-1 border-b border-gray-100">
                ✅ Incluido en el precio
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ListInput
                  label="Incluye"
                  emoji="✅"
                  items={form.incluye}
                  onChange={v => set("incluye", v)}
                  placeholder="Ej: Guía certificado"
                />
                <ListInput
                  label="No incluye"
                  emoji="❌"
                  items={form.noIncluye}
                  onChange={v => set("noIncluye", v)}
                  placeholder="Ej: Transporte al punto"
                />
              </div>
            </section>
          </div>

          {/* Footer con botón */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Los cambios se reflejarán inmediatamente en la vista del turista
            </p>
            <button
              type="submit"
              disabled={saving || loadingFicha}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Guardando…
                </>
              ) : "💾 Guardar ficha técnica"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
