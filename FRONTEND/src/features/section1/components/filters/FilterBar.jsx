import { useMemo, useState, useRef, useEffect } from "react";

const RIESGOS = [
  { key: "Alto",  label: "Alto",  dot: "bg-red-500",   badge: "bg-red-100 text-red-700 border-red-200" },
  { key: "Medio", label: "Medio", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700 border-amber-200" },
  { key: "Bajo",  label: "Bajo",  dot: "bg-green-500", badge: "bg-green-100 text-green-700 border-green-200" },
];

const DIFICULTADES = ["Principiante", "Intermedio", "Avanzado", "Experto"];

const FilterBar = ({ regions = [], filters, onChange, resultCount }) => {
  const [catOpen, setCatOpen] = useState(false);
  const [difOpen, setDifOpen] = useState(false);
  const catRef = useRef(null);
  const difRef = useRef(null);

  // Categorías desde la API
  const [categorias, setCategorias] = useState([]);
  useEffect(() => {
    fetch("/api/categorias")
      .then(r => r.json())
      .then(data => setCategorias(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
      if (difRef.current && !difRef.current.contains(e.target)) setDifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Dificultades presentes en los datos
  const dificultadesDisponibles = useMemo(() => {
    const set = new Set(regions.map(r => r.fichaTecnica?.dificultad).filter(Boolean));
    return DIFICULTADES.filter(d => set.has(d));
  }, [regions]);

  // Nombre + icono de la categoría seleccionada
  const categoriaActual = useMemo(
    () => categorias.find(c => c._id === filters.categoriaId) || null,
    [filters.categoriaId, categorias]
  );

  const handleCategoria = (id) => {
    onChange({ ...filters, categoriaId: filters.categoriaId === id ? null : id });
    setCatOpen(false);
  };

  const handleRiesgo = (key) => {
    const next = new Set(filters.riesgos);
    if (next.has(key)) {
      if (next.size === 1) return;
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange({ ...filters, riesgos: next });
  };

  const handleDificultad = (d) => {
    onChange({ ...filters, dificultad: filters.dificultad === d ? null : d });
    setDifOpen(false);
  };

  const clearAll = () =>
    onChange({ categoriaId: null, riesgos: new Set(["Alto", "Medio", "Bajo"]), dificultad: null });

  const hasActiveFilters =
    filters.categoriaId !== null ||
    filters.riesgos.size < 3 ||
    filters.dificultad !== null;

  const allRiesgo = filters.riesgos.size === 3;

  return (
    <div className="max-w-7xl mx-auto mb-4">
      <div className="bg-white rounded-2xl shadow-md border border-red-100 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">

          {/* ── Título ── */}
          <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filtros
          </div>

          <div className="w-px h-5 bg-gray-200" />

          {/* ── Dropdown categoría ── */}
          <div className="relative" ref={catRef}>
            <button
              onClick={() => { setCatOpen(o => !o); setDifOpen(false); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
                filters.categoriaId
                  ? "bg-red-600 text-white border-red-600 shadow-sm"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:border-red-300"
              }`}
            >
              {categoriaActual
                ? <span>{categoriaActual.icono}</span>
                : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
              }
              {categoriaActual?.nombre ?? "Categoría"}
              <svg className={`w-3 h-3 transition-transform ${catOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {catOpen && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[190px] max-h-64 overflow-y-auto">
                <button
                  onClick={() => { onChange({ ...filters, categoriaId: null }); setCatOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    !filters.categoriaId ? "bg-red-50 text-red-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Todas las categorías
                </button>
                <div className="border-t border-gray-100 my-1" />
                {categorias.length === 0 && (
                  <p className="px-4 py-2 text-xs text-gray-400 italic">Sin categorías</p>
                )}
                {categorias.map(cat => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategoria(cat._id)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                      filters.categoriaId === cat._id
                        ? "bg-red-50 text-red-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-base">{cat.icono}</span>
                    {cat.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Dropdown dificultad (solo si hay datos) ── */}
          {dificultadesDisponibles.length > 0 && (
            <>
              <div className="w-px h-5 bg-gray-200" />
              <div className="relative" ref={difRef}>
                <button
                  onClick={() => { setDifOpen(o => !o); setCatOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
                    filters.dificultad
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {filters.dificultad ?? "Dificultad"}
                  <svg className={`w-3 h-3 transition-transform ${difOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {difOpen && (
                  <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[150px]">
                    <button
                      onClick={() => { onChange({ ...filters, dificultad: null }); setDifOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        !filters.dificultad ? "bg-orange-50 text-orange-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Todas
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    {dificultadesDisponibles.map(d => (
                      <button
                        key={d}
                        onClick={() => handleDificultad(d)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          filters.dificultad === d
                            ? "bg-orange-50 text-orange-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="w-px h-5 bg-gray-200" />

          {/* ── Riesgo ── */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Riesgo:</span>
            {RIESGOS.map(({ key, label, dot, badge }) => {
              const active = filters.riesgos.has(key);
              return (
                <button
                  key={key}
                  onClick={() => handleRiesgo(key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                    active
                      ? `${badge} border-current shadow-sm`
                      : "bg-gray-50 text-gray-400 border-gray-200 line-through"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${active ? dot : "bg-gray-300"}`} />
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex-1" />

          {/* ── Contador + limpiar ── */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              <span className="font-bold text-gray-700">{resultCount}</span> actividad{resultCount !== 1 ? "es" : ""}
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium transition-all"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* ── Chips activos ── */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100">
            {categoriaActual && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                {categoriaActual.icono} {categoriaActual.nombre}
                <button onClick={() => onChange({ ...filters, categoriaId: null })} className="ml-0.5 hover:text-red-900">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.dificultad && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                📊 {filters.dificultad}
                <button onClick={() => onChange({ ...filters, dificultad: null })} className="ml-0.5 hover:text-orange-900">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {!allRiesgo && RIESGOS.filter(r => !filters.riesgos.has(r.key)).map(({ key, label, badge }) => (
              <span key={key} className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge} opacity-60`}>
                ✕ Sin {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
