import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "../shared/icons";
import { useAuth } from "../../../../hooks/useAuth";
import {
  ModalContainer,
  ModalHeader,
  ReadOnlyField,
  SelectField,
  CostoTotalDisplay,
  ErrorMessage,
} from "../shared/ModalComponents";
import { TOUR_MULTIPLICADORES, NIVEL_CONFIG, API_BASE_URL } from "../../utils/constants";
import { actividadesService } from "../../services/actividadesService";
import toast from "../../../../utils/toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const crearParticipante = () => ({
  nombre:              "",
  alergias:            "no",
  alergiasDetalle:     "",
  enfermedad:          "no",
  enfermedadDetalle:   "",
  medicamento:         "no",
  medicamentoDetalle:  "",
  grupoSanguineo:      "",
  telefonoRespaldo:    "",
});

const PASOS = ["Datos generales", "Participantes", "Confirmación"];

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio",
               "Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS_CORTOS = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];

// ─── CalendarioDisponibilidad ─────────────────────────────────────────────────

/**
 * Analiza todos los slots y devuelve, para un día ISO dado, su estado:
 *   { tipo: "verde"|"rojo"|"naranja", slot, riesgos, capacidad }
 *
 * Verde   → slot activo con al menos un riesgo no-Alto y capacidad > 0
 * Naranja → slot activo pero SÓLO riesgo Alto
 * Rojo    → slot inactivo/cancelado o capacidad 0
 * null    → día fuera de todos los slots
 */
const analizarDia = (isoDate, slots) => {
  const f = new Date(isoDate + "T00:00:00");
  f.setHours(0, 0, 0, 0);

  for (const slot of slots) {
    const ini = new Date(slot.fechaInicio); ini.setHours(0, 0, 0, 0);
    const fin = new Date(slot.fechaFin);   fin.setHours(23, 59, 59, 999);
    if (f < ini || f > fin) continue;

    if (slot.estado !== "activa" || slot.capacidadDisponible <= 0) {
      return { tipo: "rojo", slot, riesgos: slot.riesgos, capacidad: 0 };
    }
    const soloAlto = slot.riesgos.every(r => r.nivel === "Alto");
    return {
      tipo: soloAlto ? "naranja" : "verde",
      slot,
      riesgos: slot.riesgos,
      capacidad: slot.capacidadDisponible,
    };
  }
  return null; // fuera de rango
};

/**
 * Calendario completo con colores por disponibilidad y riesgo.
 * - Verde   = disponible (tiene riesgos Bajo/Medio)
 * - Naranja = solo riesgo Alto disponible
 * - Rojo    = sin capacidad o slot inactivo
 * - Gris    = fuera de todos los slots / pasado
 *
 * Al hacer clic en un día disponible llama a onSelect({ iso, slot }).
 */
// ─── Calendario VIP (sin restricciones de slot) ───────────────────────────────
const CalendarioVip = ({ selectedISO, onSelect }) => {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const [viewYear,  setViewYear]  = useState(hoy.getFullYear());
  const [viewMonth, setViewMonth] = useState(hoy.getMonth());

  const primerDia = new Date(viewYear, viewMonth, 1);
  const ultimoDia = new Date(viewYear, viewMonth + 1, 0);
  const startDow  = primerDia.getDay();
  const totalDias = ultimoDia.getDate();

  const celdas = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];

  const toISO = (d) => {
    const f = new Date(viewYear, viewMonth, d);
    return `${f.getFullYear()}-${String(f.getMonth()+1).padStart(2,"0")}-${String(f.getDate()).padStart(2,"0")}`;
  };
  const isPast  = (d) => { const f = new Date(viewYear, viewMonth, d); f.setHours(0,0,0,0); return f < hoy; };
  const esHoy   = (d) => { const f = new Date(viewYear, viewMonth, d); f.setHours(0,0,0,0); return f.getTime() === hoy.getTime(); };

  const prevMes = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y=>y-1); } else setViewMonth(m=>m-1); };
  const nextMes = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y=>y+1); } else setViewMonth(m=>m+1); };

  return (
    <div className="rounded-2xl overflow-hidden shadow-md border border-rose-100 select-none">
      {/* Cabecera */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-3 flex items-center justify-between">
        <button type="button" onClick={prevMes}
          className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/35 flex items-center justify-center text-white font-bold text-lg transition-all">
          ‹
        </button>
        <div className="text-center">
          <p className="text-white font-black text-base tracking-wide">{MESES[viewMonth]}</p>
          <p className="text-rose-200 text-xs font-semibold">{viewYear}</p>
        </div>
        <button type="button" onClick={nextMes}
          className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/35 flex items-center justify-center text-white font-bold text-lg transition-all">
          ›
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 bg-rose-50 border-b border-rose-100">
        {DIAS_CORTOS.map(d => (
          <div key={d} className="text-center text-xs font-black text-rose-400 py-2 uppercase tracking-wider">{d}</div>
        ))}
      </div>

      {/* Cuadrícula */}
      <div className="grid grid-cols-7 gap-px bg-gray-100">
        {celdas.map((d, i) => {
          if (!d) return <div key={`e-${i}`} className="bg-white aspect-square" />;
          const iso  = toISO(d);
          const past = isPast(d);
          const sel  = selectedISO === iso;
          const today = esHoy(d);

          if (sel) return (
            <button key={d} type="button" onClick={() => onSelect("")}
              className="bg-white aspect-square flex flex-col items-center justify-center gap-0.5 transition-all">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white text-xs font-black flex items-center justify-center shadow-lg shadow-rose-300 ring-2 ring-rose-300 ring-offset-1">
                {d}
              </span>
            </button>
          );

          if (past) return (
            <div key={d} className="bg-white aspect-square flex flex-col items-center justify-center">
              <span className="text-xs text-gray-300">{d}</span>
            </div>
          );

          return (
            <button key={d} type="button"
              onClick={() => onSelect(iso)}
              className="bg-white aspect-square flex flex-col items-center justify-center gap-0.5 hover:ring-2 hover:ring-rose-400 hover:ring-offset-1 transition-all cursor-pointer rounded-sm"
            >
              <span className={`text-xs font-bold text-gray-700 ${today ? "underline decoration-rose-400 decoration-2" : ""}`}>{d}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            </button>
          );
        })}
      </div>

      {/* Leyenda VIP */}
      <div className="bg-gray-50 border-t border-gray-100 px-4 py-2.5 flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 flex-shrink-0" /> Disponible para ti
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex-shrink-0" /> Seleccionado
        </span>
        <span className="ml-auto text-xs font-bold text-rose-500">⭐ Acceso VIP</span>
      </div>
    </div>
  );
};

// ─── Calendario con slots (usuarios normales) ─────────────────────────────────
const CalendarioDisponibilidad = ({ slots, selectedISO, onSelect }) => {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);

  const primerSlotFuturo = [...slots]
    .filter(s => new Date(s.fechaFin) >= hoy)
    .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))[0];

  const initDate = primerSlotFuturo ? new Date(primerSlotFuturo.fechaInicio) : hoy;

  const [viewYear,  setViewYear]  = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());

  const primerDia = new Date(viewYear, viewMonth, 1);
  const ultimoDia = new Date(viewYear, viewMonth + 1, 0);
  const startDow  = primerDia.getDay();
  const totalDias = ultimoDia.getDate();

  const celdas = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];

  const toISO = (d) => {
    const f = new Date(viewYear, viewMonth, d);
    return `${f.getFullYear()}-${String(f.getMonth()+1).padStart(2,"0")}-${String(f.getDate()).padStart(2,"0")}`;
  };

  const isPast = (d) => {
    const f = new Date(viewYear, viewMonth, d); f.setHours(0,0,0,0);
    return f < hoy;
  };

  const prevMes = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMes = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const esHoy = (d) => {
    const f = new Date(viewYear, viewMonth, d); f.setHours(0,0,0,0);
    return f.getTime() === hoy.getTime();
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-md border border-rose-100 select-none">

      {/* ── Cabecera con gradiente ── */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-3 flex items-center justify-between">
        <button type="button" onClick={prevMes}
          className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/35 flex items-center justify-center text-white font-bold text-lg transition-all">
          ‹
        </button>
        <div className="text-center">
          <p className="text-white font-black text-base tracking-wide">
            {MESES[viewMonth]}
          </p>
          <p className="text-rose-200 text-xs font-semibold">{viewYear}</p>
        </div>
        <button type="button" onClick={nextMes}
          className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/35 flex items-center justify-center text-white font-bold text-lg transition-all">
          ›
        </button>
      </div>

      {/* ── Días de la semana ── */}
      <div className="grid grid-cols-7 bg-rose-50 border-b border-rose-100">
        {DIAS_CORTOS.map(d => (
          <div key={d} className="text-center text-xs font-black text-rose-400 py-2 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* ── Cuadrícula de días ── */}
      <div className="grid grid-cols-7 gap-px bg-gray-100 p-0">
        {celdas.map((d, i) => {
          if (!d) return <div key={`e-${i}`} className="bg-white aspect-square" />;

          const iso   = toISO(d);
          const past  = isPast(d);
          const info  = past ? null : analizarDia(iso, slots);
          const sel   = selectedISO === iso;
          const today = esHoy(d);

          /* ── Seleccionado ── */
          if (sel) return (
            <button key={d} type="button" onClick={() => onSelect(null)}
              className="bg-white aspect-square flex flex-col items-center justify-center gap-0.5 transition-all group">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white text-xs font-black flex items-center justify-center shadow-lg shadow-rose-300 ring-2 ring-rose-300 ring-offset-1">
                {d}
              </span>
            </button>
          );

          /* ── Fuera de slots / pasado ── */
          if (!info) return (
            <div key={d}
              className={`bg-white aspect-square flex flex-col items-center justify-center ${today ? "relative" : ""}`}>
              <span className={`text-xs ${today ? "font-bold text-rose-300" : "text-gray-300"}`}>{d}</span>
              {today && <span className="w-1 h-1 rounded-full bg-rose-300 mt-0.5" />}
            </div>
          );

          /* ── Día disponible/ocupado/solo-alto ── */
          const disabled = info.tipo === "rojo";
          const dotColor = info.tipo === "verde" ? "bg-emerald-400" : info.tipo === "naranja" ? "bg-amber-400" : "bg-rose-300";
          const hoverRing = !disabled ? "hover:ring-2 hover:ring-rose-400 hover:ring-offset-1 cursor-pointer" : "cursor-not-allowed";
          const textColor = disabled
            ? "text-gray-300"
            : info.tipo === "naranja"
            ? "text-amber-700 font-bold"
            : "text-gray-700 font-bold";

          return (
            <button key={d} type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelect({ iso, slot: info.slot, riesgos: info.riesgos })}
              title={
                info.tipo === "verde"   ? `Disponible · ${info.capacidad} lugares` :
                info.tipo === "naranja" ? `Solo riesgo Alto · ${info.capacidad} lugares` :
                "Sin disponibilidad"
              }
              className={`bg-white aspect-square flex flex-col items-center justify-center gap-0.5 transition-all rounded-sm ${hoverRing}`}
            >
              <span className={`text-xs ${textColor} ${today ? "underline decoration-rose-400 decoration-2" : ""}`}>
                {d}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            </button>
          );
        })}
      </div>

      {/* ── Leyenda ── */}
      <div className="bg-gray-50 border-t border-gray-100 px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
        {[
          { dot: "bg-emerald-400", label: "Disponible" },
          { dot: "bg-amber-400",   label: "Solo riesgo Alto" },
          { dot: "bg-rose-300",    label: "Sin cupo" },
          { dot: "bg-gradient-to-br from-rose-500 to-pink-600 rounded-full", label: "Seleccionado", isRound: true },
        ].map(({ dot, label, isRound }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

/** Barra de progreso del wizard */
const BarraPasos = ({ pasoActual }) => (
  <div className="flex items-center gap-0 px-6 pt-4 pb-2">
    {PASOS.map((label, i) => {
      const num    = i + 1;
      const activo = num === pasoActual;
      const hecho  = num < pasoActual;
      return (
        <div key={num} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
              hecho  ? "bg-rose-500 border-rose-500 text-white" :
              activo ? "bg-white border-rose-500 text-rose-600" :
                       "bg-white border-gray-300 text-gray-400"
            }`}>
              {hecho ? "✓" : num}
            </div>
            <span className={`text-xs mt-1 font-medium whitespace-nowrap ${
              activo ? "text-rose-600" : hecho ? "text-rose-400" : "text-gray-400"
            }`}>{label}</span>
          </div>
          {i < PASOS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${
              hecho ? "bg-rose-400" : "bg-gray-200"
            }`} />
          )}
        </div>
      );
    })}
  </div>
);

/** Badge de nivel de riesgo */
const NivelBadge = ({ nivel }) => {
  const cfg = {
    Alto:  { bg: "bg-red-100",   text: "text-red-700",   dot: "bg-red-500",   label: "⚠️ Riesgo Alto — Solo 1 persona" },
    Medio: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "Riesgo Medio" },
    Bajo:  { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: "Riesgo Bajo" },
  }[nivel] || { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400", label: nivel };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

/** Pregunta Sí/No con textbox dinámico */
const SiNoField = ({ label, field, value, detalle, onChangeYesNo, onChangeDetalle, required = false }) => (
  <div className="space-y-2">
    <p className="text-sm font-semibold text-gray-700">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </p>
    <div className="flex gap-3">
      {["si", "no"].map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChangeYesNo(field, opt)}
          className={`px-5 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
            value === opt
              ? opt === "si"
                ? "bg-red-500 border-red-500 text-white shadow-sm"
                : "bg-green-500 border-green-500 text-white shadow-sm"
              : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
        >
          {opt === "si" ? "Sí" : "No"}
        </button>
      ))}
    </div>
    {value === "si" && (
      <textarea
        rows={2}
        placeholder={`Describe ${label.toLowerCase()}…`}
        value={detalle}
        onChange={(e) => onChangeDetalle(field, e.target.value)}
        className="w-full px-3 py-2 text-sm border border-red-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-transparent resize-none bg-red-50"
      />
    )}
  </div>
);

/** Acordeón de un participante */
const AcordeonParticipante = ({
  index, participante, onChange, onChangeYesNo, onChangeDetalle,
  abierto, onToggle, esAlto, fichaMedica, onFichaMedica
}) => {
  const tieneError = !participante.nombre.trim();

  return (
    <div className={`border-2 rounded-2xl overflow-hidden transition-all ${
      abierto ? "border-rose-300 shadow-md" : tieneError ? "border-amber-300" : "border-gray-200"
    }`}>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
          abierto ? "bg-rose-50" : "bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
            abierto ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-600"
          }`}>
            {index + 1}
          </div>
          <span className="font-semibold text-gray-800">
            {participante.nombre.trim() || `Participante ${index + 1}`}
          </span>
          {tieneError && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              Falta nombre
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${abierto ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {abierto && (
        <div className="px-4 pb-4 pt-3 space-y-4 bg-white">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nombre del participante"
              value={participante.nombre}
              onChange={(e) => onChange(index, "nombre", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-300 focus:border-transparent"
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Cuestionario de salud
            </p>
            <SiNoField
              label="¿Tiene alergias?"
              field="alergias"
              value={participante.alergias}
              detalle={participante.alergiasDetalle}
              onChangeYesNo={(f, v) => onChangeYesNo(index, f, v)}
              onChangeDetalle={(f, v) => onChangeDetalle(index, f, v)}
            />
            <SiNoField
              label="¿Padece alguna enfermedad?"
              field="enfermedad"
              value={participante.enfermedad}
              detalle={participante.enfermedadDetalle}
              onChangeYesNo={(f, v) => onChangeYesNo(index, f, v)}
              onChangeDetalle={(f, v) => onChangeDetalle(index, f, v)}
            />
            <SiNoField
              label="¿Toma algún medicamento?"
              field="medicamento"
              value={participante.medicamento}
              detalle={participante.medicamentoDetalle}
              onChangeYesNo={(f, v) => onChangeYesNo(index, f, v)}
              onChangeDetalle={(f, v) => onChangeDetalle(index, f, v)}
            />
          </div>

          {/* Datos adicionales opcionales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Grupo sanguíneo
                <span className="ml-1 text-xs font-normal text-gray-400">(opcional)</span>
              </label>
              <select
                value={participante.grupoSanguineo}
                onChange={(e) => onChange(index, "grupoSanguineo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-300 focus:border-transparent"
              >
                <option value="">— No especificado —</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Teléfono de respaldo
                <span className="ml-1 text-xs font-normal text-gray-400">(opcional)</span>
              </label>
              <input
                type="tel"
                placeholder="Ej: 70012345"
                value={participante.telefonoRespaldo}
                onChange={(e) => onChange(index, "telefonoRespaldo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-300 focus:border-transparent"
              />
            </div>
          </div>

          {esAlto && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ficha médica <span className="text-red-500">*</span>
                <span className="ml-2 text-xs font-normal text-gray-500">(PDF o imagen)</span>
              </label>
              <label className={`flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                fichaMedica
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 bg-gray-50 hover:border-rose-400 hover:bg-rose-50"
              }`}>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => onFichaMedica(e.target.files[0] || null)}
                />
                {fichaMedica ? (
                  <>
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-green-700">{fichaMedica.name}</span>
                    <span className="text-xs text-green-500">Archivo listo ✓</span>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="text-sm text-gray-500">Click para subir ficha médica</span>
                    <span className="text-xs text-gray-400">Obligatorio para riesgo Alto</span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/** Fila de resumen */
const Row = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-500">{label}</span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
);

const Tag = ({ color, label }) => {
  const colors = {
    red:   "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    blue:  "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[color]}`}>
      {label}
    </span>
  );
};

/** Resumen en el paso 3 */
const ResumenReserva = ({ actividad, formData, participantes, costoTotal, fichaMedica }) => {
  // Formato amigable de la fecha específica elegida
  const fechaLegible = formData.fechaDia
    ? new Date(formData.fechaDia + "T00:00:00").toLocaleDateString("es-BO", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      })
    : "—";

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-100">
        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
          Resumen de tu reserva
        </h4>
        <div className="space-y-2 text-sm">
          <Row label="Actividad"     value={actividad.name} />
          <Row label="Tipo de tour"  value={formData.tipoTour} />
          <Row label="Nivel riesgo"  value={formData.nivelRiesgo} />
          <Row label="Fecha elegida" value={fechaLegible} />
          <Row label="Participantes" value={`${formData.numeroPersonas} persona(s)`} />
          {fichaMedica && <Row label="Ficha médica" value={fichaMedica.name} />}
        </div>
      </div>

      <div className="space-y-2">
        {participantes.map((p, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <p className="font-semibold text-gray-800 text-sm mb-1">
              {i + 1}. {p.nombre}
            </p>
            <div className="flex flex-wrap gap-2">
              {p.alergias    === "si" && <Tag color="red"   label={`Alergias: ${p.alergiasDetalle}`} />}
              {p.enfermedad  === "si" && <Tag color="amber" label={`Enfermedad: ${p.enfermedadDetalle}`} />}
              {p.medicamento === "si" && <Tag color="blue"  label={`Medicamento: ${p.medicamentoDetalle}`} />}
              {p.alergias !== "si" && p.enfermedad !== "si" && p.medicamento !== "si" && (
                <Tag color="green" label="Sin condiciones de salud" />
              )}
            </div>
          </div>
        ))}
      </div>

      <CostoTotalDisplay
        costoTotal={costoTotal}
        precioBase={actividad.precio}
        numeroPersonas={formData.numeroPersonas}
        tipoTour={formData.tipoTour}
      />
    </div>
  );
};

// ─── Componente principal ──────────────────────────────────────────────────────

const ReservaModal = ({ isOpen, onClose, actividad }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const esVip = user?.esVip === true;

  const esAlto = actividad?.nivel === "Alto";

  const [paso,          setPaso]         = useState(1);
  const [formData,      setFormData]     = useState({
    tipoTour: "", fechaId: "", fechaDia: "", nivelRiesgo: "", numeroPersonas: 1,
  });
  const [participantes, setParticipantes] = useState([crearParticipante()]);
  const [acordeon,      setAcordeon]     = useState(0);
  const [fichaMedica,   setFichaMedica]  = useState(null);
  const [costoTotal,    setCostoTotal]   = useState(0);
  const [loading,       setLoading]      = useState(false);
  const [error,         setError]        = useState("");

  // Fechas (slots) disponibles cargadas desde el backend
  const [fechasDisp,    setFechasDisp]   = useState([]);
  const [loadingFechas, setLoadingFechas] = useState(false);

  // Reset + cargar fechas cuando se abre
  useEffect(() => {
    if (!isOpen || !actividad) return;
    setPaso(1);
    setFormData({ tipoTour: "", fechaId: "", fechaDia: "", nivelRiesgo: "", numeroPersonas: 1 });
    setParticipantes([crearParticipante()]);
    setAcordeon(0);
    setFichaMedica(null);
    setCostoTotal(0);
    setError("");

    setLoadingFechas(true);
    fetch(`${API_BASE_URL}/actividades/${actividad.id}/fechas-publicas`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setFechasDisp(Array.isArray(data) ? data : []))
      .catch(() => setFechasDisp([]))
      .finally(() => setLoadingFechas(false));
  }, [isOpen, actividad]);

  // Sincronizar array de participantes
  useEffect(() => {
    const n = Number(formData.numeroPersonas) || 1;
    setParticipantes((prev) => {
      if (n > prev.length)
        return [...prev, ...Array(n - prev.length).fill(null).map(crearParticipante)];
      return prev.slice(0, n);
    });
  }, [formData.numeroPersonas]);

  // Slot y datos derivados del día seleccionado
  const fechaSlot          = fechasDisp.find(f => f._id === formData.fechaId) || null;

  // Tipo de tour derivado
  const esVipTour     = formData.tipoTour === "VIP";
  const esPromoOInter = formData.tipoTour === "Promocional" || formData.tipoTour === "Intermedio";

  // Para tour VIP: los 3 niveles con precio fijo del admin (precioVip)
  const precioVipFijo = actividad?.precioVip ?? 0;
  const RIESGOS_FIJOS_VIP = [
    { nivel: "Bajo",  precio: precioVipFijo },
    { nivel: "Medio", precio: precioVipFijo },
    { nivel: "Alto",  precio: precioVipFijo },
  ];

  const riesgosDisp        = esVipTour ? RIESGOS_FIJOS_VIP : (fechaSlot?.riesgos || []);
  const riesgoSeleccionado = riesgosDisp.find(r => r.nivel === formData.nivelRiesgo) || null;

  // Descuento solo aplica en tour Promo/Intermedio (el precioVip ya es fijo)
  const descPct        = (!esVipTour && actividad?.enDescuento && actividad?.descuento > 0) ? actividad.descuento : 0;
  const precioSinDesc  = esVipTour ? precioVipFijo : (riesgoSeleccionado?.precio ?? 0);
  const precioBase     = descPct > 0 ? +(precioSinDesc * (1 - descPct / 100)).toFixed(2) : precioSinDesc;

  // Calcular costo total
  useEffect(() => {
    if (!formData.tipoTour || !formData.nivelRiesgo) { setCostoTotal(0); return; }
    if (esVipTour) {
      // Precio fijo del admin × personas (sin multiplicador)
      setCostoTotal(+(precioVipFijo * (Number(formData.numeroPersonas) || 1)).toFixed(2));
    } else {
      if (!riesgoSeleccionado) { setCostoTotal(0); return; }
      const mult = TOUR_MULTIPLICADORES[formData.tipoTour] || 1;
      setCostoTotal(+(precioBase * mult * (Number(formData.numeroPersonas) || 1)).toFixed(2));
    }
  }, [formData.tipoTour, formData.numeroPersonas, precioBase, precioVipFijo, riesgoSeleccionado, esVipTour]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleForm = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // Al cambiar tipo de tour se limpian fecha, slot y riesgo
  const handleTipoTour = (e) => {
    setFormData(p => ({ ...p, tipoTour: e.target.value, fechaId: "", fechaDia: "", nivelRiesgo: "" }));
  };

  // Al cambiar slot desde el calendario coloreado
  const handleSeleccionDia = (seleccion) => {
    if (!seleccion) {
      // Deseleccionar
      setFormData(p => ({ ...p, fechaId: "", fechaDia: "", nivelRiesgo: "" }));
      return;
    }
    setFormData(p => ({
      ...p,
      fechaId:     seleccion.slot._id,
      fechaDia:    seleccion.iso,
      nivelRiesgo: "", // limpiar riesgo al cambiar día
    }));
  };

  const handlePersonas = () => {}; // manejado inline con botones +/-

  const updateParticipante = useCallback((i, field, value) => {
    setParticipantes((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  }, []);

  const updateYesNo = useCallback((i, field, value) => {
    const dk = `${field}Detalle`;
    setParticipantes((prev) =>
      prev.map((p, idx) =>
        idx === i ? { ...p, [field]: value, [dk]: value === "no" ? "" : p[dk] } : p
      )
    );
  }, []);

  const updateDetalle = useCallback((i, field, value) => {
    const dk = `${field}Detalle`;
    setParticipantes((prev) =>
      prev.map((p, idx) => idx === i ? { ...p, [dk]: value } : p)
    );
  }, []);

  // ── Validaciones por paso ────────────────────────────────────────────────────

  const validarPaso1 = () => {
    if (!formData.tipoTour)                    return "Selecciona un tipo de tour";
    if (esPromoOInter && !formData.fechaId)    return "Selecciona un período disponible";
    if (!formData.fechaDia)                    return "Elige el día de la actividad";
    if (!formData.nivelRiesgo)                 return "Selecciona un nivel de riesgo";
    return null;
  };

  const validarPaso2 = () => {
    for (let i = 0; i < participantes.length; i++) {
      if (!participantes[i].nombre.trim())
        return `Ingresa el nombre del participante ${i + 1}`;
      if (participantes[i].alergias === "si" && !participantes[i].alergiasDetalle.trim())
        return `Describe las alergias del participante ${i + 1}`;
      if (participantes[i].enfermedad === "si" && !participantes[i].enfermedadDetalle.trim())
        return `Describe la enfermedad del participante ${i + 1}`;
      if (participantes[i].medicamento === "si" && !participantes[i].medicamentoDetalle.trim())
        return `Describe el medicamento del participante ${i + 1}`;
    }
    if (esAlto && !fichaMedica) return "Debes subir la ficha médica (riesgo Alto)";
    return null;
  };

  const irSiguiente = () => {
    setError("");
    const err = paso === 1 ? validarPaso1() : validarPaso2();
    if (err) { setError(err); return; }
    setPaso((p) => p + 1);
  };

  // ── Envío final ──────────────────────────────────────────────────────────────

  const handleReservar = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) { onClose(); navigate("/login"); return; }

    try {
      setLoading(true);
      setError("");

      const payload = {
        actividad:      actividad.id,
        tipoTour:       formData.tipoTour,
        ...(formData.fechaId ? { fechaId: formData.fechaId } : {}),  // omitir si vacío (VIP)
        fechaActividad: formData.fechaDia,   // día exacto elegido
        nivelRiesgo:    formData.nivelRiesgo,
        precioBase,
        numeroPersonas: formData.numeroPersonas,
        categoria:      NIVEL_CONFIG[formData.nivelRiesgo]?.categoria || "Intermedio",
        costoTotal,
        participantes:  participantes.map((p) => ({
          nombre:             p.nombre,
          alergias:           p.alergias === "si",
          alergiasDetalle:    p.alergiasDetalle,
          enfermedad:         p.enfermedad === "si",
          enfermedadDetalle:  p.enfermedadDetalle,
          medicamento:        p.medicamento === "si",
          medicamentoDetalle: p.medicamentoDetalle,
        })),
      };

      if (esAlto && fichaMedica) {
        const fd = new FormData();
        fd.append("fichaMedica", fichaMedica);
        fd.append("data", JSON.stringify(payload));
        await actividadesService.createReservaConArchivo(fd, token);
      } else {
        await actividadesService.createReserva(payload, token);
      }

      toast.success("¡Reserva creada exitosamente!");
      onClose();
      navigate("/reservas");
    } catch (err) {
      console.error("Error creando reserva:", err);
      setError(err.message || "Error al crear la reserva");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !actividad) return null;

  const maxPersonas = esAlto ? 1 : (esVipTour ? (actividad.capacidadMaxima || 10) : (fechaSlot?.capacidadDisponible || actividad.capacidadMaxima || 10));

  return (
    <ModalContainer onClose={onClose} maxWidth="max-w-2xl">
      {/* Header */}
      <ModalHeader
        title="Reservar actividad"
        subtitle={actividad.name}
        icon={<Calendar size={22} />}
        gradient="from-rose-500 to-pink-600"
        onClose={onClose}
      />

      {/* Barra de pasos */}
      <BarraPasos pasoActual={paso} />

      {/* Cuerpo */}
      <div className="px-6 pb-4 overflow-y-auto max-h-[60vh]">
        {error && <ErrorMessage message={error} />}

        {/* ── PASO 1: Datos generales ── */}
        {paso === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <ReadOnlyField label="Actividad" value={actividad.name} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700">Nivel:</span>
              <NivelBadge nivel={actividad.nivel} />
            </div>

            {esAlto && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-bold">Actividad de Riesgo Alto</p>
                  <p className="text-red-600 text-xs mt-0.5">
                    Solo se permite 1 participante. Se requiere cuestionario completo y ficha médica.
                  </p>
                </div>
              </div>
            )}

            {/* 1. Tipo de tour */}
            <SelectField
              label="Tipo de tour *"
              name="tipoTour"
              value={formData.tipoTour}
              onChange={handleTipoTour}
              options={[
                { value: "",            label: "Seleccionar tipo" },
                { value: "Promocional", label: "Promocional (−20%)" },
                { value: "VIP",         label: "VIP — Precio fijo" },
                { value: "Intermedio",  label: "Intermedio (−10%)" },
              ]}
            />

            {/* 2. Selector de fecha */}
            {formData.tipoTour && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Selecciona el día de la actividad *
              </label>

              {esVipTour ? (
                /* Tour VIP: calendario libre */
                <>
                  {precioVipFijo > 0 && (
                    <div className="mb-3 flex items-center gap-3 px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                      <span className="text-2xl">⭐</span>
                      <div>
                        <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Precio fijo VIP</p>
                        <p className="text-2xl font-black text-yellow-800">
                          Bs. {precioVipFijo.toLocaleString("es-BO")}
                          <span className="text-sm font-semibold text-yellow-600 ml-1">/ persona</span>
                        </p>
                      </div>
                    </div>
                  )}
                  <CalendarioVip
                    selectedISO={formData.fechaDia}
                    onSelect={iso => setFormData(p => ({ ...p, fechaDia: iso, fechaId: "", nivelRiesgo: "" }))}
                  />
                </>
              ) : loadingFechas ? (
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 text-sm animate-pulse">
                  Cargando disponibilidad…
                </div>
              ) : fechasDisp.length === 0 ? (
                <div className="w-full px-4 py-3 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-800 text-sm font-medium flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">⚠️</span>
                  <span>No hay fechas disponibles para esta actividad en modalidad promocional.</span>
                </div>
              ) : (
                <CalendarioDisponibilidad
                  slots={fechasDisp}
                  selectedISO={formData.fechaDia}
                  onSelect={handleSeleccionDia}
                  modoVIP={false}
                />
              )}

              {/* Confirmación del día elegido */}
              {formData.fechaDia && (
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-rose-600 bg-rose-50 rounded-xl px-3 py-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {new Date(formData.fechaDia + "T00:00:00").toLocaleDateString("es-BO", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric"
                  })}
                </div>
              )}
            </div>
            )}

            {/* 4. Nivel de riesgo — visible cuando hay día seleccionado */}
            {(formData.fechaDia && riesgosDisp.length > 0) && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nivel de riesgo *
                  {esVipTour && (
                    <span className="ml-2 text-xs font-normal text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                      Precio fijo — no varía por nivel
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {riesgosDisp.map(r => {
                    const cfg = {
                      Alto:  { bg: "bg-red-100 border-red-400 text-red-700",       sel: "bg-red-500 border-red-500 text-white" },
                      Medio: { bg: "bg-amber-100 border-amber-400 text-amber-700", sel: "bg-amber-500 border-amber-500 text-white" },
                      Bajo:  { bg: "bg-green-100 border-green-400 text-green-700", sel: "bg-green-500 border-green-500 text-white" },
                    }[r.nivel] || { bg: "bg-gray-100 border-gray-300 text-gray-600", sel: "bg-gray-500 border-gray-500 text-white" };
                    const activo = formData.nivelRiesgo === r.nivel;
                    return (
                      <button key={r.nivel} type="button"
                        onClick={() => setFormData(p => ({ ...p, nivelRiesgo: r.nivel }))}
                        className={`flex-1 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all relative ${activo ? cfg.sel : cfg.bg}`}
                      >
                        {descPct > 0 && (
                          <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full shadow">
                            -{descPct}%
                          </span>
                        )}
                        <div>{r.nivel}</div>
                        {descPct > 0 ? (
                          <div className="flex flex-col items-center">
                            <span className={`text-xs line-through opacity-60 ${activo ? "text-white" : ""}`}>
                              Bs. {r.precio?.toLocaleString("es-BO") ?? "—"}
                            </span>
                            <span className={`text-lg font-black ${activo ? "text-white" : ""}`}>
                              Bs. {(r.precio * (1 - descPct / 100)).toLocaleString("es-BO", { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        ) : (
                          <div className={`text-lg font-black ${activo ? "text-white" : ""}`}>
                            Bs. {r.precio?.toLocaleString("es-BO") ?? "—"}
                          </div>
                        )}
                        <div className={`text-xs ${activo ? "text-white/80" : "opacity-60"}`}>por persona</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. N° personas */}
            {formData.nivelRiesgo && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  N° de personas *
                </label>
                {esAlto ? (
                  <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-600 text-sm font-medium">
                    1 persona (restricción por riesgo Alto)
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button type="button"
                      onClick={() => setFormData(p => ({ ...p, numeroPersonas: Math.max(1, p.numeroPersonas - 1) }))}
                      className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-xl flex items-center justify-center transition-colors"
                    >−</button>
                    <span className="text-2xl font-bold text-gray-800 w-10 text-center">
                      {formData.numeroPersonas}
                    </span>
                    <button type="button"
                      onClick={() => setFormData(p => ({ ...p, numeroPersonas: Math.min(maxPersonas, p.numeroPersonas + 1) }))}
                      className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-xl flex items-center justify-center transition-colors"
                    >+</button>
                    <span className="text-xs text-gray-500">Máx. {maxPersonas}</span>
                  </div>
                )}
              </div>
            )}

            {/* Preview de costo */}
            {costoTotal > 0 && (
              <CostoTotalDisplay
                costoTotal={costoTotal}
                precioBase={precioBase}
                numeroPersonas={formData.numeroPersonas}
                tipoTour={formData.tipoTour}
              />
            )}
          </div>
        )}

        {/* ── PASO 2: Participantes ── */}
        {paso === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Completa el cuestionario de salud para{" "}
              <strong>{formData.numeroPersonas} participante{formData.numeroPersonas > 1 ? "s" : ""}</strong>.
            </p>

            {participantes.map((p, i) => (
              <AcordeonParticipante
                key={i}
                index={i}
                participante={p}
                abierto={acordeon === i}
                onToggle={() => setAcordeon(acordeon === i ? -1 : i)}
                onChange={updateParticipante}
                onChangeYesNo={updateYesNo}
                onChangeDetalle={updateDetalle}
                esAlto={esAlto}
                fichaMedica={esAlto ? fichaMedica : null}
                onFichaMedica={esAlto ? setFichaMedica : null}
              />
            ))}
          </div>
        )}

        {/* ── PASO 3: Confirmación ── */}
        {paso === 3 && (
          <ResumenReserva
            actividad={{ ...actividad, precio: precioBase }}
            formData={formData}
            participantes={participantes}
            costoTotal={costoTotal}
            fichaMedica={fichaMedica}
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center gap-3">
        <button
          onClick={paso === 1 ? onClose : () => { setError(""); setPaso(p => p - 1); }}
          disabled={loading}
          className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
        >
          {paso === 1 ? "Cancelar" : "← Atrás"}
        </button>

        {paso < 3 ? (
          <button
            onClick={irSiguiente}
            className="px-7 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all text-sm"
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={handleReservar}
            disabled={loading}
            className="px-7 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {loading ? "Reservando…" : "✓ Confirmar reserva"}
          </button>
        )}
      </div>
    </ModalContainer>
  );
};

export default ReservaModal;
