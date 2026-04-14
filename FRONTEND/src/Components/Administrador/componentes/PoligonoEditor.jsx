import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import poligonoService from '../../../services/poligonoService';
import toast from "../../../utils/toast";

// Patched theme for maplibre-gl v3+ compatibility
const mapboxDrawStyles = [
  {
    'id': 'gl-draw-polygon-fill',
    'type': 'fill',
    'filter': ['all', ['==', '$type', 'Polygon']],
    'paint': {
      'fill-color': ['case', ['==', ['get', 'active'], 'true'], '#fbb03b', '#3bb2d0'],
      'fill-opacity': 0.1,
    },
  },
  {
    'id': 'gl-draw-lines',
    'type': 'line',
    'filter': ['any', ['==', '$type', 'LineString'], ['==', '$type', 'Polygon']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round',
    },
    'paint': {
      'line-color': ['case', ['==', ['get', 'active'], 'true'], '#fbb03b', '#3bb2d0'],
      'line-dasharray': ['case', ['==', ['get', 'active'], 'true'], ['literal', [0.2, 2]], ['literal', [2, 0]]],
      'line-width': 2,
    },
  },
  {
    'id': 'gl-draw-point-outer',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature']],
    'paint': {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 7, 5],
      'circle-color': '#fff',
    },
  },
  {
    'id': 'gl-draw-point-inner',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature']],
    'paint': {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 5, 3],
      'circle-color': ['case', ['==', ['get', 'active'], 'true'], '#fbb03b', '#3bb2d0'],
    },
  },
  {
    'id': 'gl-draw-vertex-outer',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex'], ['!=', 'mode', 'simple_select']],
    'paint': {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 7, 5],
      'circle-color': '#fff',
    },
  },
  {
    'id': 'gl-draw-vertex-inner',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex'], ['!=', 'mode', 'simple_select']],
    'paint': {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 5, 3],
      'circle-color': '#fbb03b',
    },
  },
  {
    'id': 'gl-draw-midpoint',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'midpoint']],
    'paint': {
      'circle-radius': 3,
      'circle-color': '#fbb03b',
    },
  },
];

/**
 * PoligonoEditor
 *
 * Props:
 *  - actividad       : objeto actividad completo (con ubicacion.coordinates y .zona)
 *  - onClose         : callback para cerrar (opcional)
 *  - onUbicacionChange : callback llamado cuando el usuario mueve/coloca el marcador
 *                        o edita la zona. Recibe { type, coordinates, zona }
 */
export default function PoligonoEditor({ actividad, onClose, onUbicacionChange }) {
  const mapContainer = useRef(null);
  const map          = useRef(null);
  const draw         = useRef(null);

  // ── Estado de polígonos ────────────────────────────────────────────────
  const [poligonos,       setPoligonos]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [nombre,          setNombre]          = useState('');
  const [riesgo,          setRiesgo]          = useState('Medio');
  const [temporada,       setTemporada]       = useState('Todas');
  const [isSaving,        setIsSaving]        = useState(false);
  const [modoActual,      setModoActual]      = useState('simple_select');

  // ── Estado de ubicación de la actividad ───────────────────────────────
  const initLng = actividad.ubicacion?.coordinates?.[0] ?? -68.1193;
  const initLat = actividad.ubicacion?.coordinates?.[1] ?? -16.4897;

  const [ubicacionLocal, setUbicacionLocal] = useState({
    lng:  initLng,
    lat:  initLat,
    zona: actividad.ubicacion?.zona ?? '',
  });

  // refs para evitar stale closure en los event listeners del mapa
  const zonaRef             = useRef(actividad.ubicacion?.zona ?? '');
  const ubicacionLngRef     = useRef(initLng);
  const ubicacionLatRef     = useRef(initLat);
  const locationMarkerRef   = useRef(null);
  const modoUbicacionRef    = useRef(false);
  const [modoUbicacion, _setModoUbicacion] = useState(false);

  /** Activa / desactiva el modo "clic para colocar ubicación" */
  const setModoUbicacion = (val) => {
    modoUbicacionRef.current = val;
    _setModoUbicacion(val);
    if (map.current) {
      map.current.getCanvas().style.cursor = val ? 'crosshair' : '';
    }
  };

  // ── Sincronizar refs cuando cambia el estado de ubicación ─────────────
  useEffect(() => {
    ubicacionLngRef.current = ubicacionLocal.lng;
    ubicacionLatRef.current = ubicacionLocal.lat;
    zonaRef.current         = ubicacionLocal.zona;
  }, [ubicacionLocal]);

  // ── Cargar polígonos existentes ───────────────────────────────────────
  useEffect(() => {
    cargarPoligonos();
  }, [actividad._id]);

  const cargarPoligonos = async () => {
    try {
      setLoading(true);
      const data = await poligonoService.obtenerPoligonos(actividad._id);
      setPoligonos(data);
    } catch (error) {
      console.error('Error cargando poligonos:', error);
      toast.error('Error cargando los polígonos');
    } finally {
      setLoading(false);
    }
  };

  // ── Inicialización del mapa ───────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || !actividad || loading) return;

    if (!map.current) {
      // ── Crear mapa ──────────────────────────────────────────────────
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://api.maptiler.com/maps/019d1c5d-755e-7e19-a2e9-ca9c3a4216c9/style.json?key=prXtDiqIkjyYJLAWIKfB',
        center: [initLng, initLat],
        zoom: 14,
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Parche de compatibilidad MapboxDraw ↔ MapLibre
      map.current.getCanvas().classList.add('mapboxgl-canvas');
      if (mapContainer.current) {
        mapContainer.current.classList.add('mapboxgl-map');
      }

      // ── Herramienta de dibujo de polígonos ─────────────────────────
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {},
        defaultMode: 'simple_select',
        styles: mapboxDrawStyles,
      });

      map.current.addControl(draw.current, 'top-left');

      map.current.on('draw.create',          updateArea);
      map.current.on('draw.delete',          updateArea);
      map.current.on('draw.update',          updateArea);
      map.current.on('draw.selectionchange', updateArea);
      map.current.on('draw.modechange', (e) => {
        setModoActual(e.mode);
        if (e.mode === 'draw_polygon') {
          map.current.getCanvas().style.cursor = 'crosshair';
          // Salir de modo ubicación al empezar a dibujar polígono
          if (modoUbicacionRef.current) setModoUbicacion(false);
        } else if (!modoUbicacionRef.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });

      // ── Marcador rojo arrastrable para la ubicación principal ───────
      if (!locationMarkerRef.current) {
        locationMarkerRef.current = new maplibregl.Marker({
          color: '#dc2626',   // rojo
          draggable: true,
        })
          .setLngLat([initLng, initLat])
          .addTo(map.current);

        // Al terminar de arrastrar → actualizar coords
        locationMarkerRef.current.on('dragend', () => {
          const { lng, lat } = locationMarkerRef.current.getLngLat();
          setUbicacionLocal(prev => ({ ...prev, lng, lat }));
          onUbicacionChange?.({
            type:        'Point',
            coordinates: [lng, lat],
            zona:        zonaRef.current,
          });
        });

        // Click en el mapa → solo actúa cuando modoUbicacion está ON
        //  y el draw está en simple_select (no dibujando polígono)
        map.current.on('click', (e) => {
          if (!modoUbicacionRef.current) return;
          const currentMode = draw.current?.getMode?.() || 'simple_select';
          if (currentMode !== 'simple_select') return;

          const { lng, lat } = e.lngLat;
          locationMarkerRef.current?.setLngLat([lng, lat]);
          setUbicacionLocal(prev => ({ ...prev, lng, lat }));
          onUbicacionChange?.({
            type:        'Point',
            coordinates: [lng, lat],
            zona:        zonaRef.current,
          });
          // Auto-desactivar modo ubicación tras colocar el punto
          setModoUbicacion(false);
        });
      }
    }

    // Dibujar polígonos existentes
    if (map.current && map.current.isStyleLoaded() && draw.current) {
      renderPoligonosExistentes();
    } else if (map.current) {
      map.current.once('load', renderPoligonosExistentes);
    }

    return () => {
      // No limpiamos map.current por el double-invoke de React 18 StrictMode
    };
  }, [actividad, loading, poligonos]);

  // ── Renderizar polígonos guardados en el mapa ─────────────────────────
  const renderPoligonosExistentes = () => {
    try {
      draw.current.deleteAll();
      poligonos.forEach(p => {
        draw.current.add({
          id:         p._id,
          type:       'Feature',
          properties: { ...p },
          geometry:   p.geometria,
        });
      });
    } catch (e) {
      console.error(e);
    }
  };

  // ── Selección / deselección de feature en el mapa ────────────────────
  const updateArea = () => {
    const selected = draw.current.getSelected();

    if (selected.features.length > 0) {
      const feat = selected.features[0];
      setSelectedFeature(feat);

      if (feat.properties?.nombre) {
        setNombre(feat.properties.nombre);
        setRiesgo(feat.properties.riesgo);
        setTemporada(feat.properties.temporada);
      } else {
        setNombre('Nuevo Polígono');
        setRiesgo('Medio');
        setTemporada('Todas');
      }
    } else {
      setSelectedFeature(null);
    }
  };

  // ── Guardar polígono ──────────────────────────────────────────────────
  const guardarPoligono = async () => {
    if (!selectedFeature) return;
    if (!nombre.trim()) return toast.error('El nombre es requerido');

    setIsSaving(true);
    try {
      const geometria = selectedFeature.geometry;
      const payload   = { nombre, geometria, riesgo, temporada };
      const isNew     = !selectedFeature.properties?._id;

      if (isNew) {
        await poligonoService.crearPoligono(actividad._id, payload);
        toast.success('✅ Polígono creado exitosamente');
      } else {
        await poligonoService.actualizarPoligono(actividad._id, selectedFeature.properties._id, payload);
        toast.success('✅ Polígono actualizado exitosamente');
      }

      await cargarPoligonos();
      setSelectedFeature(null);
      if (draw.current) {
        draw.current.deleteAll();
        renderPoligonosExistentes();
      }
    } catch (error) {
      console.error('Error detallado:', error);
      const mensaje = error.response?.data?.message || error.message || 'Error al guardar el polígono';
      toast.error(`❌ ${mensaje}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Eliminar polígono desde la lista ─────────────────────────────────
  const eliminarPoligonoDesdeLista = async (pId) => {
    if (!confirm('¿Eliminar permanente?')) return;
    try {
      await poligonoService.eliminarPoligono(actividad._id, pId);
      cargarPoligonos();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  // ── Controles del toolbar ─────────────────────────────────────────────
  const iniciarDibujo = () => {
    if (!draw.current) return;
    if (modoUbicacionRef.current) setModoUbicacion(false);
    draw.current.changeMode('draw_polygon');
    setModoActual('draw_polygon');
    setSelectedFeature(null);
  };

  const activarEdicion = () => {
    if (!draw.current) return;
    if (!selectedFeature) return toast.info('Selecciona un polígono haciendo clic sobre él en el mapa primero.');
    if (selectedFeature.id) {
      draw.current.changeMode('direct_select', { featureId: selectedFeature.id });
      setModoActual('direct_select');
    }
  };

  const eliminarDibujoActual = () => {
    if (!draw.current) return;
    if (selectedFeature) {
      draw.current.delete(selectedFeature.id);
      setSelectedFeature(null);
    } else {
      draw.current.trash();
    }
    draw.current.changeMode('simple_select');
    setModoActual('simple_select');
  };

  // ── Helper colores de riesgo ──────────────────────────────────────────
  const getColorClase = (r) => {
    if (r === 'Alto')  return 'text-red-600 font-bold';
    if (r === 'Medio') return 'text-amber-600 font-bold';
    return 'text-green-600 font-bold';
  };

  // ── Manejar cambio de zona (texto) ────────────────────────────────────
  const handleZonaChange = (e) => {
    const zona = e.target.value;
    zonaRef.current = zona;
    setUbicacionLocal(prev => ({ ...prev, zona }));
    onUbicacionChange?.({
      type:        'Point',
      coordinates: [ubicacionLngRef.current, ubicacionLatRef.current],
      zona,
    });
  };

  // ── RENDER ────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col md:flex-row gap-6">

      {/* ── Columna Izquierda: Mapa ── */}
      <div className="w-full md:w-2/3 flex flex-col relative h-[500px]">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl">
            Cargando polígonos...
          </div>
        )}

        {/* Toolbar flotante sobre el mapa */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">

          {/* ── Botones de polígonos ── */}
          <button
            onClick={iniciarDibujo}
            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg shadow-md transition-all ${
              modoActual === 'draw_polygon'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
            title="Crear un nuevo polígono de riesgo"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Crear
          </button>

          <button
            onClick={activarEdicion}
            disabled={!selectedFeature}
            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg shadow-md transition-all ${
              modoActual === 'direct_select'
                ? 'bg-blue-600 text-white'
                : !selectedFeature
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
            title={!selectedFeature ? 'Haz clic en un polígono para editarlo' : 'Editar vértices del polígono'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
            Editar
          </button>

          {(selectedFeature || modoActual !== 'simple_select') && (
            <button
              onClick={eliminarDibujoActual}
              className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 font-bold rounded-lg shadow-md hover:bg-red-50 transition-all border border-red-100 mt-2"
              title="Eliminar dibujo seleccionado"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
              Borrar
            </button>
          )}

          {/* ── Separador ── */}
          <div className="h-px bg-gray-200 mx-1 my-1" />

          {/* ── Botón modo Ubicar ── */}
          <button
            onClick={() => setModoUbicacion(!modoUbicacion)}
            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg shadow-md transition-all ${
              modoUbicacion
                ? 'bg-red-600 text-white ring-2 ring-red-300'
                : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
            }`}
            title={modoUbicacion
              ? 'Haz clic en el mapa para colocar la ubicación de la actividad'
              : 'Activar: clic en el mapa para mover la ubicación principal'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Ubicar
          </button>
        </div>

        {/* Contenedor del mapa */}
        <div
          ref={mapContainer}
          className="w-full h-full rounded-xl border-2 border-orange-200 overflow-hidden"
        />
      </div>

      {/* ── Columna Derecha: Formulario ── */}
      <div className="w-full md:w-1/3 flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-1">

        {/* Panel del polígono seleccionado / instrucciones */}
        {selectedFeature ? (
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <h4 className="font-bold text-gray-800 mb-3">
              {(!selectedFeature.properties?._id) ? 'Nuevo Polígono' : 'Editar Polígono'}
            </h4>

            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-3"
              placeholder="Ej. Zona de rocas"
            />

            <label className="block text-sm font-semibold text-gray-700 mb-1">Riesgo</label>
            <select
              value={riesgo}
              onChange={e => setRiesgo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-3"
            >
              <option value="Bajo">Bajo</option>
              <option value="Medio">Medio</option>
              <option value="Alto">Alto</option>
            </select>

            <label className="block text-sm font-semibold text-gray-700 mb-1">Temporada</label>
            <select
              value={temporada}
              onChange={e => setTemporada(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            >
              <option value="Todas">Todas</option>
              <option value="Lluvias">Lluvias</option>
              <option value="Seca">Seca</option>
              <option value="Invierno">Invierno</option>
              <option value="Verano">Verano</option>
            </select>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSelectedFeature(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={guardarPoligono}
                disabled={isSaving}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-orange-700 disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-sm text-blue-800">
            <p className="font-bold mb-2">Instrucciones — Polígonos:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Haz clic en <strong>"Crear"</strong> para dibujar un área de riesgo.</li>
              <li>Doble clic o clic en el punto inicial para cerrar el polígono.</li>
              <li>Selecciona un polígono y usa <strong>"Editar"</strong> para mover sus vértices.</li>
            </ul>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            Sección de Ubicación Principal de la Actividad
            ══════════════════════════════════════════════════════════════ */}
        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Ubicación de la Actividad
          </h4>

          {/* Aviso cuando modo ubicación está activo */}
          {modoUbicacion && (
            <div className="mb-3 flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-lg px-3 py-2 text-xs text-orange-800 font-semibold">
              <span className="text-base">🎯</span>
              <span>Haz clic en el mapa para colocar el marcador...</span>
            </div>
          )}

          {/* Campo Zona */}
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Zona / Descripción
          </label>
          <input
            type="text"
            value={ubicacionLocal.zona}
            onChange={handleZonaChange}
            className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
            placeholder="Ej: Coroico, La Paz"
          />

          {/* Coordenadas (solo lectura, se actualizan por el marcador) */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white rounded-lg p-2.5 border border-red-100">
              <p className="text-xs text-gray-500 font-medium mb-0.5">Longitud</p>
              <p className="text-xs font-mono font-bold text-gray-800">
                {ubicacionLocal.lng.toFixed(6)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-red-100">
              <p className="text-xs text-gray-500 font-medium mb-0.5">Latitud</p>
              <p className="text-xs font-mono font-bold text-gray-800">
                {ubicacionLocal.lat.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Ayuda */}
          <p className="text-xs text-gray-400 leading-relaxed">
            💡 <span className="text-red-600 font-semibold">Arrastra el marcador rojo</span> o presiona{' '}
            <strong className="text-gray-600">"Ubicar"</strong> y haz clic en el mapa para actualizar las coordenadas.
          </p>
        </div>

        {/* Lista de polígonos guardados */}
        <div className="flex flex-col gap-2 border-t pt-4">
          <h4 className="font-bold text-gray-800">Polígonos Guardados</h4>
          {poligonos.length === 0 && (
            <p className="text-gray-500 text-sm">No hay polígonos creados para esta actividad.</p>
          )}

          {poligonos.map(p => (
            <div
              key={p._id}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200"
            >
              <div>
                <p className="font-bold text-sm text-gray-800">{p.nombre}</p>
                <p className="text-xs text-gray-500">
                  Riesgo: <span className={getColorClase(p.riesgo)}>{p.riesgo}</span> | {p.temporada}
                </p>
                {p.areaHectareas && (
                  <p className="text-xs text-gray-500">Área: {p.areaHectareas.toFixed(2)} ha</p>
                )}
              </div>
              <button
                onClick={() => eliminarPoligonoDesdeLista(p._id)}
                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg"
                title="Eliminar permanentemente"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
