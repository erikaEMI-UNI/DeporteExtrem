import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAPTILER_KEY = "F9w0jIIX0voFsVRWF3O8";

const NIVELES = [
  { nivel: 1, label: "Departamentos" },
  { nivel: 2, label: "Provincias" },
  { nivel: 3, label: "Municipios" },
];

// Convierte el array de regions a GeoJSON FeatureCollection
const toGeoJSON = (regions) => ({
  type: "FeatureCollection",
  features: regions
    .filter((r) => r.coordinates && Array.isArray(r.coordinates))
    .map((r) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [r.coordinates[1], r.coordinates[0]], // [lng, lat]
      },
      properties: {
        id:     r.id    ?? r._id ?? "",
        name:   r.name  ?? "",
        riesgo: r.nivel  ?? "Bajo",   // el campo en formatActividad es `nivel`
        sport:  r.sport  ?? "",
        level:  r.level  ?? "",
      },
    })),
});

// Calcula bounding box desde cualquier geometría GeoJSON
const getBBox = (geometry) => {
  if (!geometry?.coordinates) return null;
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  const walk = (c) => {
    if (typeof c[0] === "number") {
      if (c[0] < minLng) minLng = c[0];
      if (c[0] > maxLng) maxLng = c[0];
      if (c[1] < minLat) minLat = c[1];
      if (c[1] > maxLat) maxLat = c[1];
    } else c.forEach(walk);
  };
  walk(geometry.coordinates);
  if (!isFinite(minLng)) return null;
  return [[minLng, minLat], [maxLng, maxLat]];
};

const MapSection = ({ regions, onSelectRegion, onHoverRegion, riesgoFilter }) => {
  const mapContainerRef  = useRef(null);
  const mapRef           = useRef(null);
  const isMapInitialized = useRef(false);
  const onSelectRef      = useRef(onSelectRegion);
  const onHoverRef       = useRef(onHoverRegion);
  const regionsRef       = useRef(regions);
  const poligonosCache   = useRef(null);
  // Ref del nivel para que los event handlers del mapa lean el valor actual
  const nivelRef         = useRef(1);

  const [nivelActivo,   setNivelActivo]   = useState(1);
  const [historial,     setHistorial]     = useState([]); // S2-C: pila de navegación
  const [selectedActId, setSelectedActId] = useState(null); // S3-B: filtro polígonos
  const [exporting,     setExporting]     = useState(false);

  onSelectRef.current = onSelectRegion;
  onHoverRef.current  = onHoverRegion;
  regionsRef.current  = regions;

  // ─── EFECTO 1: Inicializar mapa ────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || isMapInitialized.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/hybrid-v4/style.json?key=${MAPTILER_KEY}`,
      center:  [-64.685, -16.29],
      zoom:    4,
      pitch:   10,
      bearing: -5,
    });

    mapRef.current           = map;
    isMapInitialized.current = true;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {

      // ── Source: actividades con clustering ──────────────────────────────
      map.addSource("actividades", {
        type:           "geojson",
        data:           { type: "FeatureCollection", features: [] },
        cluster:        true,
        clusterMaxZoom: 10,
        clusterRadius:  50,
      });

      // Círculos de cluster — tamaño y color según cantidad
      map.addLayer({
        id:     "clusters",
        type:   "circle",
        source: "actividades",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step", ["get", "point_count"],
            "#38bdf8", 5, "#f59e0b", 10, "#ef4444",
          ],
          "circle-radius": [
            "step", ["get", "point_count"],
            22, 5, 32, 10, 42,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
          "circle-opacity":      0.9,
        },
      });

      // Número dentro del cluster
      map.addLayer({
        id:     "cluster-count",
        type:   "symbol",
        source: "actividades",
        filter: ["has", "point_count"],
        layout: { "text-field": "{point_count_abbreviated}", "text-size": 14 },
        paint:  { "text-color": "#fff" },
      });

      // Puntos individuales
      map.addLayer({
        id:     "unclustered-point",
        type:   "circle",
        source: "actividades",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": [
            "match", ["get", "riesgo"],
            "Alto",  "#ef4444",
            "Medio", "#f59e0b",
            "#10b981",
          ],
          "circle-radius":       9,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // ── Source: polígonos de riesgo ─────────────────────────────────────
      // S3-A: minzoom: 10 → solo aparecen cuando ya se ven actividades individuales
      map.addSource("poligonos-riesgo", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id:      "poligonos-fill",
        type:    "fill",
        source:  "poligonos-riesgo",
        minzoom: 10,                     // ← S3-A: solo en zoom alto
        paint: {
          "fill-color": [
            "match", ["get", "riesgo"],
            "Alto",  "#ef4444",
            "Medio", "#f59e0b",
            "#10b981",
          ],
          "fill-opacity": 0.22,
        },
      });

      map.addLayer({
        id:      "poligonos-outline",
        type:    "line",
        source:  "poligonos-riesgo",
        minzoom: 10,                     // ← S3-A: solo en zoom alto
        paint: {
          "line-color": [
            "match", ["get", "riesgo"],
            "Alto",  "#ef4444",
            "Medio", "#f59e0b",
            "#10b981",
          ],
          "line-width":   2,
          "line-opacity": 0.9,
        },
      });

      // Popup hover polígono
      const popupPoli = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 5,
      });

      map.on("mouseenter", "poligonos-fill", (e) => {
        map.getCanvas().style.cursor = "help";
        const { nombre, riesgo, actividad, area } = e.features[0].properties;
        popupPoli
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="font-size:12px;line-height:1.6">
              <strong>${nombre ?? "Zona de riesgo"}</strong><br/>
              Riesgo: <b>${riesgo}</b><br/>
              ${actividad ? `Actividad: ${actividad}<br/>` : ""}
              ${area       ? `Área: ${Number(area).toFixed(2)} ha`  : ""}
            </div>`
          )
          .addTo(map);
      });
      map.on("mousemove",  "poligonos-fill", (e) => popupPoli.setLngLat(e.lngLat));
      map.on("mouseleave", "poligonos-fill", () => {
        map.getCanvas().style.cursor = "";
        popupPoli.remove();
      });

      // ── Source: límites Bolivia ─────────────────────────────────────────
      map.addSource("bolivia-geo", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id:     "bolivia-fill",
        type:   "fill",
        source: "bolivia-geo",
        paint:  { "fill-color": "#4A90D9", "fill-opacity": 0.07 },
      });

      map.addLayer({
        id:     "bolivia-outline",
        type:   "line",
        source: "bolivia-geo",
        paint:  { "line-color": "#4A90D9", "line-width": 1.5, "line-opacity": 0.8 },
      });

      // ── EVENTOS ─────────────────────────────────────────────────────────

      // S1: Click cluster → zoom in con Promise (MapLibre, no callback)
      map.on("click", "clusters", async (e) => {
        const [feat] = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        if (!feat) return;
        const coords    = feat.geometry.coordinates.slice();
        const clusterId = feat.properties.cluster_id;
        try {
          const expansionZoom = await map.getSource("actividades")
            .getClusterExpansionZoom(clusterId);
          map.flyTo({ center: coords, zoom: expansionZoom + 0.5, speed: 1.4, curve: 1.2, essential: true });
        } catch {
          map.flyTo({ center: coords, zoom: map.getZoom() + 2, speed: 1.4, essential: true });
        }
      });

      // S3-B: Click punto individual → seleccionar actividad + filtrar polígonos
      map.on("click", "unclustered-point", (e) => {
        const { id, name } = e.features[0].properties;
        const region = regionsRef.current.find(
          (r) => (r.id ?? r._id) === id || r.name === name
        );
        if (!region) return;
        // Filtrar polígonos a los de esta actividad
        setSelectedActId(region.id ?? region._id ?? null);
        onSelectRef.current?.(region);
      });

      // S2-C: Click en región geográfica → zoom + siguiente nivel
      map.on("click", "bolivia-fill", (e) => {
        // No disparar si hay marcadores encima
        const marcadores = map.queryRenderedFeatures(e.point, {
          layers: ["clusters", "unclustered-point"],
        });
        if (marcadores.length > 0) return;

        const feat = e.features?.[0];
        if (!feat) return;

        const nivelActual = nivelRef.current;
        if (nivelActual >= 3) return; // ya en el nivel más profundo

        // Guardar estado en historial para poder volver
        setHistorial((prev) => [
          ...prev,
          { nivel: nivelActual, center: map.getCenter().toArray(), zoom: map.getZoom() },
        ]);

        // Avanzar nivel
        const siguiente = nivelActual + 1;
        nivelRef.current = siguiente;
        setNivelActivo(siguiente);

        // Volar al bbox de la región clickeada
        const bbox = getBBox(feat.geometry);
        if (bbox) {
          map.fitBounds(bbox, { padding: 60, duration: 900, maxZoom: 13 });
        } else {
          map.easeTo({ center: e.lngLat, zoom: map.getZoom() + 2 });
        }
      });

      // Cursores hover
      map.on("mouseenter", "unclustered-point", (e) => {
        map.getCanvas().style.cursor = "pointer";
        const { id, name } = e.features[0].properties;
        const region = regionsRef.current.find(
          (r) => (r.id ?? r._id) === id || r.name === name
        );
        if (region) onHoverRef.current?.(region, e.originalEvent);
      });
      map.on("mousemove", "unclustered-point", (e) => {
        const { id, name } = e.features[0].properties;
        const region = regionsRef.current.find(
          (r) => (r.id ?? r._id) === id || r.name === name
        );
        if (region) onHoverRef.current?.(region, e.originalEvent);
      });
      map.on("mouseleave", "unclustered-point", () => {
        map.getCanvas().style.cursor = "";
        onHoverRef.current?.(null);
      });
      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });
      // Cursor "lupa" en regiones geográficas clickeables
      map.on("mouseenter", "bolivia-fill", (e) => {
        const marcadores = map.queryRenderedFeatures(e.point, {
          layers: ["clusters", "unclustered-point"],
        });
        if (marcadores.length === 0 && nivelRef.current < 3) {
          map.getCanvas().style.cursor = "zoom-in";
        }
      });
      map.on("mouseleave", "bolivia-fill", () => {
        map.getCanvas().style.cursor = "";
      });
    }); // end map.on("load")

    return () => {
      map.remove();
      mapRef.current           = null;
      isMapInitialized.current = false;
    };
  }, []);

  // ─── EFECTO 2: Actualizar actividades cuando cambian ──────────────────────
  // IMPORTANTE: no saltear cuando regions.length === 0 — eso significa que
  // el filtro dejó 0 resultados y hay que limpiar el mapa también.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const update = () => {
      const src = map.getSource("actividades");
      if (src) src.setData(toGeoJSON(regions));
    };
    map.loaded() ? update() : map.once("load", update);
  }, [regions]);

  // ─── EFECTO 3: Polígonos — fetch paralelo al mapa ─────────────────────────
  useEffect(() => {
    let cancelled = false;

    const applyPoligonos = (data) => {
      const map = mapRef.current;
      if (!map || !map.getSource("poligonos-riesgo")) return;
      map.getSource("poligonos-riesgo").setData(data);
    };

    const fetchPoligonos = async () => {
      try {
        const res = await fetch("/api/geo/poligonos");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        poligonosCache.current = data;
        const map = mapRef.current;
        if (map?.loaded()) applyPoligonos(data);
        else map?.once("load", () => applyPoligonos(data));
      } catch (e) {
        console.warn("Polígonos no disponibles:", e.message);
      }
    };

    fetchPoligonos();

    // Si el mapa ya está montado pero aún no cargó
    const map = mapRef.current;
    if (map && !map.loaded()) {
      map.once("load", () => {
        if (poligonosCache.current) applyPoligonos(poligonosCache.current);
      });
    }

    // Refrescar al volver de otra pestaña
    const onVisible = () => { if (!document.hidden) fetchPoligonos(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // ─── EFECTO 4: Cargar límites Bolivia según nivel activo ──────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/geo/bolivia?nivel=${nivelActivo}`);
        if (!res.ok) return;
        const data = await res.json();
        const src = map.getSource("bolivia-geo");
        if (src) src.setData(data);
      } catch (e) {
        console.warn("Límites no disponibles:", e.message);
      }
    };
    map.loaded() ? load() : map.once("load", load);
  }, [nivelActivo]);

  // ─── EFECTO 5: Filtrar polígonos (por actividad seleccionada Y por riesgo) ──
  // Combina ambos filtros: solo muestra polígonos que pasen los dos criterios.
  useEffect(() => {
    const map = mapRef.current;
    if (!map?.loaded()) return;

    // Niveles de riesgo activos (viene del prop riesgoFilter o muestra todos)
    const nivelesActivos = riesgoFilter
      ? Array.from(riesgoFilter)
      : ["Alto", "Medio", "Bajo"];

    // Construir expresión de filtro combinada
    let filter;
    if (selectedActId && nivelesActivos.length < 3) {
      // Ambos filtros activos
      filter = ["all",
        ["==", ["get", "actividadId"], String(selectedActId)],
        ["in", ["get", "riesgo"], ["literal", nivelesActivos]],
      ];
    } else if (selectedActId) {
      // Solo filtro por actividad
      filter = ["==", ["get", "actividadId"], String(selectedActId)];
    } else if (nivelesActivos.length < 3) {
      // Solo filtro por riesgo
      filter = ["in", ["get", "riesgo"], ["literal", nivelesActivos]];
    } else {
      // Sin filtro → mostrar todos
      filter = null;
    }

    if (map.getLayer("poligonos-fill"))    map.setFilter("poligonos-fill",    filter);
    if (map.getLayer("poligonos-outline")) map.setFilter("poligonos-outline", filter);
  }, [selectedActId, riesgoFilter]);

  // ─── Acción: Volver nivel anterior (S2-C) ─────────────────────────────────
  const volver = () => {
    const prev = historial[historial.length - 1];
    if (!prev) return;
    setHistorial((h) => h.slice(0, -1));
    nivelRef.current = prev.nivel;
    setNivelActivo(prev.nivel);
    mapRef.current?.flyTo({ center: prev.center, zoom: prev.zoom, duration: 900 });
  };

  // ─── Acción: Resetear todo ─────────────────────────────────────────────────
  const resetearVista = () => {
    setHistorial([]);
    setSelectedActId(null);
    nivelRef.current = 1;
    setNivelActivo(1);
    mapRef.current?.flyTo({
      center:   [-64.685, -16.29],
      zoom:     4,
      pitch:    10,
      bearing:  -5,
      duration: 1200,
    });
  };

  // ─── Acción: Exportar zona visible ────────────────────────────────────────
  const exportarZonaVisible = () => {
    const map = mapRef.current;
    if (!map) return;
    setExporting(true);
    try {
      const bounds   = map.getBounds();
      const visibles = regions.filter((r) => {
        if (!r.coordinates) return false;
        const [lat, lng] = r.coordinates;
        return bounds.contains([lng, lat]);
      });
      const geojson = {
        type: "FeatureCollection",
        exportedAt: new Date().toISOString(),
        bounds: bounds.toArray(),
        features: visibles.map((r) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [r.coordinates[1], r.coordinates[0]] },
          properties: { nombre: r.name, riesgo: r.riesgo, deporte: r.sport, nivel: r.level },
        })),
      };
      const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/geo+json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `zona_exportada_${Date.now()}.geojson`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full">

      {/* ── Controles superiores izquierda ── */}
      <div className="absolute top-3 left-3 z-10 flex gap-2 flex-wrap items-center">

        {/* Selector de nivel administrativo */}
        <div className="bg-white/90 backdrop-blur rounded-xl shadow px-2 py-1.5 flex gap-1">
          {NIVELES.map(({ nivel, label }) => (
            <button
              key={nivel}
              onClick={() => {
                nivelRef.current = nivel;
                setNivelActivo(nivel);
              }}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                nivelActivo === nivel
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Botón Volver — solo si hay historial (S2-C) */}
        {historial.length > 0 && (
          <button
            onClick={volver}
            className="bg-white/90 backdrop-blur rounded-xl shadow px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
        )}

        {/* Botón Bolivia completa */}
        <button
          onClick={resetearVista}
          title="Ver Bolivia completa"
          className="bg-white/90 backdrop-blur rounded-xl shadow px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
          </svg>
          Bolivia completa
        </button>

        {/* Quitar filtro de polígonos (S3-B) — solo si hay actividad seleccionada */}
        {selectedActId && (
          <button
            onClick={() => setSelectedActId(null)}
            className="bg-rose-500/90 backdrop-blur rounded-xl shadow px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600 flex items-center gap-1.5 transition-all"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Ver todos los polígonos
          </button>
        )}

        {/* Botón exportar */}
        <button
          onClick={exportarZonaVisible}
          disabled={exporting}
          className="bg-white/90 backdrop-blur rounded-xl shadow px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {exporting ? "Exportando…" : "Exportar zona"}
        </button>
      </div>

      {/* ── Indicador de nivel + profundidad (esquina inferior izquierda) ── */}
      <div className="absolute bottom-4 left-3 z-10">
        <div className="bg-black/50 backdrop-blur text-white text-xs rounded-lg px-3 py-1.5 flex items-center gap-2">
          <span className="opacity-60">Nivel:</span>
          <span className="font-semibold">
            {NIVELES.find((n) => n.nivel === nivelActivo)?.label}
          </span>
          {historial.length > 0 && (
            <span className="opacity-50 ml-1">
              · {historial.length} nivel{historial.length > 1 ? "es" : ""} atrás
            </span>
          )}
          {nivelActivo < 3 && (
            <span className="opacity-40 ml-1">· Click en zona para profundizar</span>
          )}
        </div>
      </div>

      {/* ── Mapa ── */}
      <div
        ref={mapContainerRef}
        className="w-full h-[600px] rounded-2xl shadow-inner"
      />
    </div>
  );
};

export default MapSection;
