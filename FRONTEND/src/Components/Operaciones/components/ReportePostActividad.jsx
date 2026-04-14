"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import toast from "../../../utils/toast";

const API = "/api";
const token = () => localStorage.getItem("authToken");
const authH = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });
const hoy   = () => new Date().toISOString().split("T")[0];

const fetchJSON = async (url, opts = {}) => {
  const res = await fetch(url, { headers: authH(), ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.msg || `Error ${res.status}`);
  return data;
};

// ── Botón Sí/No grande (uso en campo) ────────────────────────────────────────
const BtnSiNo = ({ value, onChange }) => (
  <div className="flex gap-3">
    {[true, false].map(opt => (
      <button
        key={String(opt)}
        type="button"
        onClick={() => onChange(opt)}
        className={`flex-1 py-4 rounded-2xl font-extrabold text-lg border-2 transition-all
          ${value === opt
            ? opt
              ? "bg-green-500 border-green-500 text-white shadow-md"
              : "bg-red-500 border-red-500 text-white shadow-md"
            : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
      >
        {opt ? "✓  Sí" : "✗  No"}
      </button>
    ))}
  </div>
);

// ── Sección con número y título ───────────────────────────────────────────────
const Seccion = ({ num, titulo, color = "blue", children }) => {
  const cols = {
    blue:   "bg-blue-600",
    green:  "bg-green-600",
    red:    "bg-red-600",
    gray:   "bg-gray-500",
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className={`${cols[color]} px-4 py-3 flex items-center gap-3`}>
        <span className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {num}
        </span>
        <h3 className="text-white font-extrabold text-base">{titulo}</h3>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
export default function ReportePostActividad() {
  const { user } = useAuth();

  const [actividades, setActividades] = useState([]);
  const [actividadId, setActividadId] = useState("");
  const [fecha,       setFecha]       = useState(hoy());
  const [enviando,    setEnviando]    = useState(false);
  const [enviado,     setEnviado]     = useState(false);

  // Sección 1: participantes
  const [participantesCompletos, setParticipantesCompletos] = useState(null);
  // Sección 2: equipos
  const [equiposCompletos,       setEquiposCompletos]       = useState(null);
  // Sección 3: incidente
  const [huboIncidente,          setHuboIncidente]          = useState(null);
  const [incidente, setIncidente] = useState({
    descripcion:           "",
    atencionMedica:        false,
    atencionMedicaDetalle: "",
    momento:               "",
    participanteAfectado:  "",
  });
  // Sección 4: observaciones
  const [observaciones, setObservaciones] = useState("");

  // Cargar actividades
  useEffect(() => {
    fetchJSON(`${API}/actividades`)
      .then(data => {
        const activas = (Array.isArray(data) ? data : []).filter(a => a.activo);
        setActividades(activas);
      })
      .catch(() => toast.error("No se pudieron cargar las actividades"));
  }, []);

  const limpiarForm = () => {
    setParticipantesCompletos(null);
    setEquiposCompletos(null);
    setHuboIncidente(null);
    setIncidente({ descripcion:"", atencionMedica:false, atencionMedicaDetalle:"", momento:"", participanteAfectado:"" });
    setObservaciones("");
    setEnviado(false);
  };

  const validar = () => {
    if (!actividadId)              return "Selecciona una actividad";
    if (participantesCompletos === null) return "Indica si todos los participantes completaron la actividad";
    if (equiposCompletos === null)       return "Indica si todos los equipos fueron devueltos";
    if (huboIncidente === null)          return "Indica si hubo algún incidente";
    if (huboIncidente && !incidente.descripcion.trim())
      return "Describe el incidente ocurrido";
    if (huboIncidente && !incidente.momento.trim())
      return "Indica el momento en que ocurrió el incidente";
    return null;
  };

  const handleEnviar = async () => {
    const err = validar();
    if (err) return toast.error(err);

    setEnviando(true);
    try {
      // 1. Crear reporte
      const reporte = await fetchJSON(`${API}/reportes-actividad`, {
        method: "POST",
        body: JSON.stringify({
          actividad:            actividadId,
          fechaActividad:       fecha,
          tipo:                 "post_actividad",
          participantesCompletos,
          equiposCompletos,
          huboIncidente,
          incidente:            huboIncidente ? incidente : {},
          observaciones,
        }),
      });

      // 2. Enviar al admin
      await fetchJSON(`${API}/reportes-actividad/${reporte._id}/enviar`, {
        method: "POST",
      });

      setEnviado(true);
      toast.success(
        huboIncidente
          ? "⚠️ Reporte enviado con prioridad ALTA por incidente"
          : "✅ Reporte post-actividad enviado al administrador"
      );
    } catch (e) {
      toast.error(e.message || "Error al enviar el reporte");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
          huboIncidente ? "bg-orange-100" : "bg-green-100"
        }`}>
          <span className="text-5xl">{huboIncidente ? "⚠️" : "✅"}</span>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Reporte enviado</h2>
        <p className="text-gray-500 mb-2">
          {huboIncidente
            ? "El administrador ha sido notificado con prioridad ALTA."
            : "El administrador recibirá el reporte de la actividad."}
        </p>
        {huboIncidente && (
          <span className="px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-bold mb-6">
            Prioridad ALTA — Incidente reportado
          </span>
        )}
        <button
          onClick={limpiarForm}
          className="mt-6 px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors"
        >
          Nuevo reporte
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-4 pt-6 pb-8">
        <h1 className="text-2xl font-extrabold mb-1">Reporte post-actividad</h1>
        <p className="text-indigo-200 text-sm">Completa al finalizar la actividad</p>
      </div>

      <div className="px-4 -mt-4 space-y-4 max-w-lg mx-auto">

        {/* Selector de actividad y fecha */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Actividad</label>
            <select
              value={actividadId}
              onChange={e => { setActividadId(e.target.value); setEnviado(false); }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            >
              <option value="">Seleccionar actividad…</option>
              {actividades.map(a => (
                <option key={a._id} value={a._id}>{a.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha de la actividad</label>
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sección 1: Participantes */}
        <Seccion num="1" titulo="Participantes" color="blue">
          <p className="text-sm font-semibold text-gray-700">
            ¿Todos los participantes completaron la actividad?
          </p>
          <BtnSiNo value={participantesCompletos} onChange={setParticipantesCompletos} />
          {participantesCompletos === false && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 font-medium">
              ⚠️ Reporta en la sección de incidentes si algún participante no completó por causa de un problema.
            </div>
          )}
        </Seccion>

        {/* Sección 2: Equipos */}
        <Seccion num="2" titulo="Equipos" color="green">
          <p className="text-sm font-semibold text-gray-700">
            ¿Todos los equipos fueron devueltos en buen estado?
          </p>
          <BtnSiNo value={equiposCompletos} onChange={setEquiposCompletos} />
          {equiposCompletos === false && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 font-medium">
              ⚠️ Detalla los equipos faltantes o dañados en observaciones.
            </div>
          )}
        </Seccion>

        {/* Sección 3: Incidentes */}
        <Seccion num="3" titulo="Incidentes" color={huboIncidente ? "red" : "gray"}>
          <p className="text-sm font-semibold text-gray-700">
            ¿Hubo algún incidente durante la actividad?
          </p>
          <BtnSiNo value={huboIncidente} onChange={setHuboIncidente} />

          {huboIncidente && (
            <div className="space-y-4 mt-2">
              {/* Alerta prioridad alta */}
              <div className="bg-red-50 border-l-4 border-red-500 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
                🚨 Se notificará al administrador con <strong>prioridad ALTA</strong>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Descripción del incidente <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe qué ocurrió con detalle…"
                  value={incidente.descripcion}
                  onChange={e => setIncidente(p => ({ ...p, descripcion: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                />
              </div>

              {/* Participante afectado */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Participante afectado
                </label>
                <input
                  type="text"
                  placeholder="Nombre del participante…"
                  value={incidente.participanteAfectado}
                  onChange={e => setIncidente(p => ({ ...p, participanteAfectado: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent"
                />
              </div>

              {/* Momento */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Momento del incidente <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Al inicio, durante el descenso, km 3…"
                  value={incidente.momento}
                  onChange={e => setIncidente(p => ({ ...p, momento: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent"
                />
              </div>

              {/* Atención médica */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">
                  ¿Se requirió atención médica?
                </p>
                <div className="flex gap-3">
                  {[true, false].map(opt => (
                    <button
                      key={String(opt)}
                      type="button"
                      onClick={() => setIncidente(p => ({ ...p, atencionMedica: opt }))}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all
                        ${incidente.atencionMedica === opt
                          ? opt
                            ? "bg-red-500 border-red-500 text-white"
                            : "bg-green-500 border-green-500 text-white"
                          : "bg-white border-gray-200 text-gray-500"
                        }`}
                    >
                      {opt ? "Sí" : "No"}
                    </button>
                  ))}
                </div>
                {incidente.atencionMedica && (
                  <textarea
                    rows={2}
                    placeholder="Describe la atención médica proporcionada…"
                    value={incidente.atencionMedicaDetalle}
                    onChange={e => setIncidente(p => ({ ...p, atencionMedicaDetalle: e.target.value }))}
                    className="mt-2 w-full px-4 py-3 border border-red-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none bg-red-50"
                  />
                )}
              </div>
            </div>
          )}
        </Seccion>

        {/* Sección 4: Observaciones */}
        <Seccion num="4" titulo="Observaciones generales" color="gray">
          <textarea
            rows={4}
            placeholder="Notas adicionales sobre la actividad, condiciones, sugerencias…"
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
          />
        </Seccion>

      </div>

      {/* Botón enviar fijo abajo */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-lg mx-auto">
          {huboIncidente && (
            <p className="text-center text-red-600 text-xs font-bold mb-2">
              ⚠️ Se notificará al administrador con PRIORIDAD ALTA
            </p>
          )}
          <button
            onClick={handleEnviar}
            disabled={enviando}
            className={`w-full py-4 font-extrabold text-lg rounded-2xl shadow-lg transition-all disabled:opacity-50 text-white
              ${huboIncidente
                ? "bg-gradient-to-r from-red-600 to-orange-600 hover:shadow-red-200"
                : "bg-gradient-to-r from-indigo-600 to-purple-700"
              }`}
          >
            {enviando ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Enviando reporte…
              </span>
            ) : huboIncidente ? (
              "🚨 Enviar reporte de incidente"
            ) : (
              "✓ Enviar reporte al administrador"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
