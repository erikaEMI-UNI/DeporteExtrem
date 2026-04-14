"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../hooks/useAuth";
import toast from "../../../utils/toast";

const API = "/api";
const token = () => localStorage.getItem("authToken");
const authH = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

// ── Helpers ──────────────────────────────────────────────────────────────────
const hoy = () => new Date().toISOString().split("T")[0];

const fetchJSON = async (url, opts = {}) => {
  const res = await fetch(url, { headers: authH(), ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.msg || `Error ${res.status}`);
  return data;
};

// ── Chip de estado ─────────────────────────────────────────────────────────
const Chip = ({ ok, label }) => (
  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ok ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
    {label}
  </span>
);

// ── Fila de participante (grande para uso en campo) ──────────────────────────
const FilaParticipante = ({ participante, index, onChange }) => (
  <label
    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all select-none
      ${participante.presente
        ? "border-green-400 bg-green-50 shadow-sm"
        : "border-gray-200 bg-white hover:border-gray-300"}`}
  >
    {/* Checkbox grande */}
    <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all
      ${participante.presente ? "bg-green-500 border-green-500" : "border-gray-300 bg-white"}`}>
      {participante.presente && (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    <input type="checkbox" className="sr-only" checked={participante.presente}
      onChange={e => onChange(index, e.target.checked)} />

    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className={`font-bold text-base truncate ${participante.presente ? "text-green-800" : "text-gray-800"}`}>
        {participante.nombre}
      </p>
    </div>

    {/* Estado visual */}
    {participante.presente
      ? <span className="text-green-500 text-2xl flex-shrink-0">✓</span>
      : <span className="text-gray-300 text-2xl flex-shrink-0">○</span>
    }
  </label>
);

// ── Componente principal ──────────────────────────────────────────────────────
export default function ListaPreSalida() {
  const { user } = useAuth();

  const [actividades,    setActividades]    = useState([]);
  const [actividadId,    setActividadId]    = useState("");
  const [fecha,          setFecha]          = useState(hoy());
  const [participantes,  setParticipantes]  = useState([]);
  const [cargando,       setCargando]       = useState(false);
  const [enviando,       setEnviando]       = useState(false);
  const [busqueda,       setBusqueda]       = useState("");
  const [enviado,        setEnviado]        = useState(false);

  // Cargar actividades activas al montar
  useEffect(() => {
    fetchJSON(`${API}/actividades`)
      .then(data => {
        const activas = (Array.isArray(data) ? data : []).filter(a => a.activo);
        setActividades(activas);
      })
      .catch(() => toast.error("No se pudieron cargar las actividades"));
  }, []);

  // Cargar participantes cuando cambian actividad o fecha
  useEffect(() => {
    if (!actividadId || !fecha) { setParticipantes([]); return; }
    setCargando(true);
    setEnviado(false);
    fetchJSON(`${API}/reportes-actividad/participantes/${actividadId}/${fecha}`)
      .then(data => setParticipantes(data.participantes || []))
      .catch(() => {
        toast.error("Error al cargar participantes");
        setParticipantes([]);
      })
      .finally(() => setCargando(false));
  }, [actividadId, fecha]);

  // Filtrar por búsqueda
  const listaFiltrada = useMemo(() =>
    participantes.filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    ), [participantes, busqueda]);

  const presentes   = participantes.filter(p => p.presente).length;
  const total       = participantes.length;
  const todosPresentes = total > 0 && presentes === total;

  const toggleParticipante = (index, valor) => {
    // Índice en participantes, no en listaFiltrada
    const nombre = listaFiltrada[index].nombre;
    setParticipantes(prev =>
      prev.map(p => p.nombre === nombre ? { ...p, presente: valor } : p)
    );
  };

  const marcarTodos = (valor) => {
    setParticipantes(prev => prev.map(p => ({ ...p, presente: valor })));
  };

  const enviarEstado = async () => {
    if (!actividadId) return toast.error("Selecciona una actividad");
    if (total === 0) return toast.error("No hay participantes para esta fecha");

    setEnviando(true);
    try {
      // 1. Crear el reporte (devuelve el objeto con _id)
      const reporte = await fetchJSON(`${API}/reportes-actividad`, {
        method: "POST",
        body: JSON.stringify({
          actividad:              actividadId,
          fechaActividad:         fecha,
          tipo:                   "pre_salida",
          participantesPresentes: participantes,
          todosPresentes,
        }),
      });

      // 2. Enviar usando el _id que acaba de devolver el POST
      await fetchJSON(`${API}/reportes-actividad/${reporte._id}/enviar`, { method: "POST" });

      setEnviado(true);
      toast.success("✅ Lista de asistencia enviada al administrador");
    } catch (err) {
      toast.error(err.message || "Error al enviar");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 pt-6 pb-8">
        <h1 className="text-2xl font-extrabold mb-1">Lista pre-salida</h1>
        <p className="text-blue-200 text-sm">Confirma la asistencia antes de iniciar la actividad</p>
      </div>

      <div className="px-4 -mt-4 space-y-4 max-w-lg mx-auto">
        {/* Selector de actividad y fecha */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Actividad</label>
            <select
              value={actividadId}
              onChange={e => setActividadId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            >
              <option value="">Seleccionar actividad…</option>
              {actividades.map(a => (
                <option key={a._id} value={a._id}>{a.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Contador y botones globales */}
        {total > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-3xl font-extrabold text-gray-800">
                  {presentes}
                  <span className="text-gray-400 text-lg font-normal"> / {total}</span>
                </p>
                <p className="text-xs text-gray-500">participantes presentes</p>
              </div>
              {/* Progress bar */}
              <div className="w-24">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${total ? (presentes / total) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-right mt-1 text-gray-500">
                  {total ? Math.round((presentes / total) * 100) : 0}%
                </p>
              </div>
            </div>

            {/* Botones Todos / Ninguno */}
            <div className="flex gap-2">
              <button
                onClick={() => marcarTodos(true)}
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-sm transition-colors"
              >
                ✓ Todos presentes
              </button>
              <button
                onClick={() => marcarTodos(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}

        {/* Buscador */}
        {total > 4 && (
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar participante…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
            />
          </div>
        )}

        {/* Lista de participantes */}
        {cargando ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Cargando participantes…</p>
          </div>
        ) : !actividadId ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
            <p className="font-medium">Selecciona una actividad y fecha</p>
          </div>
        ) : listaFiltrada.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
            <p className="font-medium">Sin reservas confirmadas para esta fecha</p>
          </div>
        ) : (
          <div className="space-y-2">
            {listaFiltrada.map((p, i) => (
              <FilaParticipante key={i} participante={p} index={i} onChange={toggleParticipante} />
            ))}
          </div>
        )}
      </div>

      {/* Botón de envío — fijo en la parte inferior */}
      {total > 0 && !enviado && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-lg mx-auto">
            {todosPresentes && (
              <p className="text-center text-green-600 text-xs font-bold mb-2">
                ✓ Todos los participantes están presentes
              </p>
            )}
            <button
              onClick={enviarEstado}
              disabled={enviando || total === 0}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-extrabold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviando ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Enviando…
                </span>
              ) : (
                `Enviar lista al administrador (${presentes}/${total})`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Estado: enviado */}
      {enviado && (
        <div className="fixed bottom-0 left-0 right-0 p-4">
          <div className="max-w-lg mx-auto bg-green-500 text-white rounded-2xl py-4 text-center font-bold shadow-lg">
            ✅ Lista enviada al administrador
          </div>
        </div>
      )}
    </div>
  );
}
