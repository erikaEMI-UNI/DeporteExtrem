"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
//fechas gestion
import GestionFechas from "./GestionFechas";
import PoligonoEditor from "./componentes/PoligonoEditor";
import toast from "../../utils/toast";

// Configuración — usa el proxy de Vite (/api → http://localhost:3000/api)
const API_BASE_URL = "/api";

/* ─── Editor de modelos 3D (lista + subida + eliminación) ─────────────────── */
function Modelos3DEditor({ modelos, subiendo, inputRef, onSubir, onEliminar }) {
  const [nombrePendiente, setNombrePendiente] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onSubir(file, nombrePendiente || file.name.replace(/\.[^.]+$/, ''));
    setNombrePendiente('');
    e.target.value = '';
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
      <p className="text-sm font-semibold text-gray-700 mb-1">🧊 Modelos 3D del equipamiento</p>
      <p className="text-xs text-gray-400 mb-3">Soporta .glb y .fbx · máx 100 MB por archivo</p>

      {/* Lista de modelos existentes */}
      {modelos.length > 0 ? (
        <div className="space-y-2 mb-3">
          {modelos.map((m) => (
            <div key={m._id} className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-purple-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="text-xs text-purple-700 font-semibold flex-1 truncate">{m.nombre}</span>
              <span className="text-xs text-gray-400 truncate max-w-[120px]">{m.url.split('/').pop()}</span>
              <button
                type="button"
                onClick={() => onEliminar(m._id)}
                className="text-red-400 hover:text-red-600 text-xs font-semibold flex-shrink-0"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic mb-3">Sin modelos 3D aún</p>
      )}

      {/* Campo nombre + botón subir */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nombre del modelo (ej: Casco)"
          value={nombrePendiente}
          onChange={(e) => setNombrePendiente(e.target.value)}
          className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          ref={inputRef}
          type="file"
          accept=".glb,.fbx"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          disabled={subiendo}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
        >
          {subiendo ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Subiendo…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Agregar modelo
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Grupos de íconos para el selector de categoría
const ICON_GROUPS = [
  {
    label: "Deportes extremos",
    icons: ["🧗","🪂","🚣","🛶","🏄","🤿","🏂","⛷️","🎿","🏇","🤸","🧘"],
  },
  {
    label: "Montaña y naturaleza",
    icons: ["🏔️","⛰️","🌋","🗻","🥾","🌿","🌊","🏞️","🌄","🦅","🌵","🪨"],
  },
  {
    label: "Aventura y acción",
    icons: ["🎯","⚡","🔥","💥","🏹","🗡️","🛡️","🪓","🔭","🧭","🪝","🎪"],
  },
  {
    label: "Vehículos",
    icons: ["🚵","🚴","🏍️","🛵","🚁","🛸","🚀","⛵","🛥️","🚤","🪂","🛺"],
  },
  {
    label: "Otros deportes",
    icons: ["⚽","🏀","🎾","⛳","🏊","🤼","🥊","🏋️","🤺","🏌️","🎣","🧩"],
  },
];

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token enviado:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No hay token');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= ICONOS ================= */
const Search = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const Plus = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14m-7-7h14" />
  </svg>
);

const Eye = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const Edit = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const Trash = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const X = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m18 6-12 12m0-12 12 12" />
  </svg>
);

const MapPin = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const Image = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const AlertTriangle = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4m0 4h.01" />
  </svg>
);

const Check = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Save = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const Video = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const Music = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const Link = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const Globe = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" x2="22" y1="12" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const Calendar = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

/* ================= MODAL DEL MAPA ================= */
function MapPickerModal({ isOpen, onClose, initialLng, initialLat, onSelectLocation }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [lng, setLng] = useState(initialLng);
  const [lat, setLat] = useState(initialLat);
  const [zoom, setZoom] = useState(14);

  useEffect(() => {
    if (!isOpen || !mapContainer.current) return;

    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://api.maptiler.com/maps/019d1c5d-755e-7e19-a2e9-ca9c3a4216c9/style.json?key=prXtDiqIkjyYJLAWIKfB',
        center: [lng, lat],
        zoom: zoom
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      marker.current = new maplibregl.Marker({ draggable: true })
        .setLngLat([lng, lat])
        .addTo(map.current);

      marker.current.on('dragend', () => {
        const lngLat = marker.current.getLngLat();
        setLng(lngLat.lng);
        setLat(lngLat.lat);
      });

      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        setLng(lng);
        setLat(lat);
        marker.current.setLngLat([lng, lat]);
      });
    } else {
      map.current.setCenter([lng, lat]);
      marker.current.setLngLat([lng, lat]);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isOpen, lng, lat, zoom]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">Seleccionar ubicación en el mapa</h3>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Longitud</label>
              <input type="number" value={lng} onChange={(e) => setLng(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-lg" step="any" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Latitud</label>
              <input type="number" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-lg" step="any" />
            </div>
          </div>
        </div>

        <div ref={mapContainer} className="w-full h-[400px]" />

        <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600">
            Cancelar
          </button>
          <button onClick={() => onSelectLocation(lng, lat)} className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700">
            Seleccionar esta ubicación
          </button>
        </div>
      </div>
    </div>
  );
}
///////////////////////////////////////////////////////
/* ================= COMPONENTE PRINCIPAL ================= */
/* ─── Panel: modelos 3D por categoría ─────────────────────────────────────── */
function Modelos3DCategoriasPanel({ categorias, onUpdate }) {
  const [subiendo, setSubiendo]   = useState(null); // id de categoría que está subiendo
  const [nombres, setNombres]     = useState({});   // nombre pendiente por categoría
  const [abierto, setAbierto]     = useState(null); // categoría expandida
  const inputsRef                 = useRef({});

  const handleFile = async (catId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('modelo', file);
    formData.append('nombre', nombres[catId]?.trim() || file.name.replace(/\.[^.]+$/, ''));
    setSubiendo(catId);
    try {
      const res = await fetch(`/api/categorias/${catId}/modelo3d`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir');
      onUpdate({ _id: catId, modelos3d: data.modelos3d });
      setNombres(prev => ({ ...prev, [catId]: '' }));
    } catch (err) {
      alert(err.message);
    } finally {
      setSubiendo(null);
    }
  };

  const handleEliminar = async (catId, modeloId) => {
    if (!confirm('¿Eliminar este modelo 3D?')) return;
    try {
      const res = await fetch(`/api/categorias/${catId}/modelo3d/${modeloId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      onUpdate({ _id: catId, modelos3d: data.modelos3d });
    } catch (err) {
      alert(err.message);
    }
  };

  if (categorias.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden mt-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">🧊 Modelos 3D por Categoría</h2>
        <p className="text-purple-100 text-sm">
          Sube un modelo una vez y se aplica automáticamente a todas las actividades de esa categoría
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {categorias.map(cat => {
          const isOpen    = abierto === cat._id;
          const modelos   = cat.modelos3d || [];
          const esteSubiendo = subiendo === cat._id;

          return (
            <div key={cat._id}>
              {/* Fila de categoría */}
              <button
                type="button"
                onClick={() => setAbierto(isOpen ? null : cat._id)}
                className="w-full flex items-center gap-3 px-6 py-4 hover:bg-purple-50 transition-colors text-left"
              >
                <span className="text-2xl">{cat.icono}</span>
                <span className="flex-1 font-semibold text-gray-800">{cat.nombre}</span>
                <span className="text-xs text-gray-400 mr-2">
                  {modelos.length === 0 ? 'Sin modelos' : `${modelos.length} modelo${modelos.length > 1 ? 's' : ''}`}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {/* Panel expandido */}
              {isOpen && (
                <div className="px-6 pb-5 bg-purple-50/40">
                  {/* Lista de modelos */}
                  {modelos.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {modelos.map(m => (
                        <div key={m._id} className="flex items-center gap-3 bg-white border border-purple-200 rounded-lg px-3 py-2">
                          <svg className="w-4 h-4 text-purple-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                          <span className="text-sm font-semibold text-purple-700 flex-1">{m.nombre}</span>
                          <span className="text-xs text-gray-400 truncate max-w-[140px]">{m.url.split('/').pop()}</span>
                          <button
                            type="button"
                            onClick={() => handleEliminar(cat._id, m._id)}
                            className="text-red-400 hover:text-red-600 text-xs font-semibold ml-2 flex-shrink-0"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic mb-4">Sin modelos 3D para esta categoría</p>
                  )}

                  {/* Subir nuevo */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nombre del modelo (ej: Casco)"
                      value={nombres[cat._id] || ''}
                      onChange={e => setNombres(prev => ({ ...prev, [cat._id]: e.target.value }))}
                      className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <input
                      ref={el => { inputsRef.current[cat._id] = el; }}
                      type="file"
                      accept=".glb,.fbx"
                      className="hidden"
                      onChange={e => { handleFile(cat._id, e.target.files[0]); e.target.value = ''; }}
                    />
                    <button
                      type="button"
                      disabled={esteSubiendo}
                      onClick={() => inputsRef.current[cat._id]?.click()}
                      className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
                      {esteSubiendo ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Subiendo…
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          Agregar modelo
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ActividadesConPermisos() {
  const { user } = useAuth();
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [editingFechas, setEditingFechas] = useState([]);
  const [nuevaFecha, setNuevaFecha] = useState({
    fechaInicio: '',
    fechaFin: '',
    capacidadDisponible: 15,
    riesgos: {
      bajo: { activo: false, precio: '' },
      medio: { activo: false, precio: '' },
      alto: { activo: false, precio: '' }
    },
    estado: 'activa'
  });
  const [editingFecha, setEditingFecha] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'fechas', 'poligonos'
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingActivity, setViewingActivity] = useState(null);
  const [viewFechas, setViewFechas] = useState([]);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapModalFor, setMapModalFor] = useState(null);

  // Categorías
  const [todasCategorias, setTodasCategorias]   = useState([]);
  const [nuevaCatNombre, setNuevaCatNombre]      = useState("");
  const [nuevaCatIcono, setNuevaCatIcono]        = useState("🏔️");
  const [creandoCategoria, setCreandoCategoria]  = useState(false);
  const [iconPickerOpen, setIconPickerOpen]          = useState(false);
  const iconPickerRef                                = useRef(null);
  const [iconPickerOpenEdit, setIconPickerOpenEdit]  = useState(false);
  const iconPickerRefEdit                            = useRef(null);
  const [subiendo3d, setSubiendo3d]                 = useState(false);
  const modelo3dInputRef                            = useRef(null);

  const [newActivity, setNewActivity] = useState({
    nombre: "",
    descripcion: "",
    recomendaciones: "",
    tieneVip: false,
    precioVip: 0,
    enDescuento: false,
    descuento: 0,
    nivelesSeleccionados: [],
    preciosPorNivel: { "Bajo": 0, "Medio": 0, "Alto": 0 },
    fecha_inicio: "",
    fecha_fin: "",
    duracion: 0,
    capacidadMaxima: 1,
    multimedia: { imagenes: [], videos: [], panoramicas: [], videos360: [], audio: [], enlacesInternos: [] },
    ubicacion: {
      zona: "",
      type: "Point",
      coordinates: [-68.1193, -16.4897]
    },
    categorias: [],
    activo: true,
  });

  // Permisos
  const puedeCrear = user?.permisos?.includes("crear_actividad");
  const puedeListar = user?.permisos?.includes("listar_actividades");
  const puedeVer = user?.permisos?.includes("ver_actividad");
  const puedeEditar = user?.permisos?.includes("editar_actividad");
  const puedeEliminar = user?.permisos?.includes("eliminar_actividad");

  const token = localStorage.getItem("authToken") || user?.token;

  useEffect(() => {
    if (puedeListar && token) cargarActividades();
  }, [puedeListar, token]);

  useEffect(() => {
    fetch("/api/categorias?todas=true", {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    })
      .then(r => r.json())
      .then(data => setTodasCategorias(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(e.target))
        setIconPickerOpen(false);
      if (iconPickerRefEdit.current && !iconPickerRefEdit.current.contains(e.target))
        setIconPickerOpenEdit(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Efecto para inicializar correctamente nivelesSeleccionados cuando se abre el modal de edición
  useEffect(() => {
    if (isEditModalOpen && editingActivity) {
      if (!editingActivity.nivelesSeleccionados || editingActivity.nivelesSeleccionados.length === 0) {
        const nivelesConfigurados = editingActivity.nivelesConfigurados || [];
        const nivelesSeleccionados = nivelesConfigurados.map(n => n.riesgo);
        const preciosPorNivel = {};
        nivelesConfigurados.forEach(n => {
          preciosPorNivel[n.riesgo] = n.precio;
        });

        setEditingActivity({
          ...editingActivity,
          nivelesSeleccionados,
          preciosPorNivel
        });
      }
    }
  }, [isEditModalOpen]);

  const cargarActividades = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/actividades`);
      setActividades(response.data);
    } catch (error) {
      console.error("Error cargando actividades:", error);
    } finally {
      setLoading(false);
    }
  };

  /*const cargarFechas = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/actividades/${id}/fechas/rango`);
      setEditingFechas(response.data);
    } catch (error) {
      console.error('Error cargando fechas:', error);
    }
  };*/

  const cargarFechas = async (id) => {
    try {
      console.log('Cargando fechas para actividad:', id);
      // Cambiar de '/fechas/rango' a '/fechas'
      const response = await axios.get(`${API_BASE_URL}/actividades/${id}/fechas`);
      console.log('Fechas recibidas:', response.data);

      // Asegurar que response.data es un array
      const fechasArray = Array.isArray(response.data) ? response.data : [];

      setEditingFechas(fechasArray);
    } catch (error) {
      console.error('Error cargando fechas:', error);
      setEditingFechas([]); // Vaciar fechas en caso de error
    }
  };

  const calcularDuracionFechas = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) return '';

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffMs = fin - inicio;
    const diffHoras = diffMs / (1000 * 60 * 60);

    if (diffHoras < 24) {
      return `${Math.round(diffHoras * 10) / 10} horas`;
    } else {
      const dias = Math.floor(diffHoras / 24);
      const horasRestantes = Math.round((diffHoras % 24) * 10) / 10;
      return horasRestantes > 0 ? `${dias} días ${horasRestantes} horas` : `${dias} días`;
    }
  };

  const agregarFecha = async () => {
    // Validaciones
    if (!nuevaFecha.fechaInicio || !nuevaFecha.fechaFin) {
      return toast.error('❌ Fecha de inicio y fin son requeridas');
    }

    const inicio = new Date(nuevaFecha.fechaInicio);
    const fin = new Date(nuevaFecha.fechaFin);

    if (fin <= inicio) {
      return toast.error('❌ La fecha de fin debe ser posterior a la fecha de inicio');
    }

    if (nuevaFecha.capacidadDisponible <= 0) {
      return toast.error('❌ La capacidad debe ser mayor a 0');
    }

    if (nuevaFecha.capacidadDisponible > (editingActivity.capacidadMaxima || 999)) {
      return toast.error(`❌ La capacidad no puede ser mayor a ${editingActivity.capacidadMaxima || 999}`);
    }

    // Validar que al menos un riesgo esté seleccionado
    const riesgosSeleccionados = [];
    let error = false;

    Object.entries(nuevaFecha.riesgos).forEach(([nivel, data]) => {
      if (data.activo) {
        if (!data.precio || parseFloat(data.precio) < 0) {
          toast.error(`❌ Precio inválido para nivel ${nivel}`);
          error = true;
          return;
        }
        riesgosSeleccionados.push({
          nivel: nivel.charAt(0).toUpperCase() + nivel.slice(1),
          precio: parseFloat(data.precio)
        });
      }
    });

    if (error) return;

    if (riesgosSeleccionados.length === 0) {
      return toast.error('❌ Debes seleccionar al menos un nivel de riesgo');
    }

    try {
      const duracion = calcularDuracionFechas(nuevaFecha.fechaInicio, nuevaFecha.fechaFin);

      const fechaData = {
        fechaInicio: nuevaFecha.fechaInicio,
        fechaFin: nuevaFecha.fechaFin,
        duracion,
        capacidadDisponible: nuevaFecha.capacidadDisponible,
        riesgos: riesgosSeleccionados,
        estado: nuevaFecha.estado,
        actividadId: editingActivity._id
      };

      const response = await axios.post(`${API_BASE_URL}/actividades/${editingActivity._id}/fechas`, fechaData);

      setEditingFechas([...editingFechas, response.data]);

      // Resetear formulario
      setNuevaFecha({
        fechaInicio: '',
        fechaFin: '',
        capacidadDisponible: editingActivity.capacidadMaxima || 20,
        riesgos: {
          bajo: { activo: false, precio: '' },
          medio: { activo: false, precio: '' },
          alto: { activo: false, precio: '' }
        },
        estado: 'activa'
      });

      toast.success('✅ Fecha agregada correctamente');
    } catch (error) {
      toast.error(error.response?.data?.error || '❌ Error al agregar fecha');
    }
  };

  const eliminarFecha = async (fechaId) => {
    if (!confirm('¿Eliminar esta fecha?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/actividades/${editingActivity._id}/fechas/${fechaId}`);
      setEditingFechas(editingFechas.filter(f => f._id !== fechaId));
      toast.success('✅ Fecha eliminada');
    } catch (error) {
      toast.error(error.response?.data?.error || '❌ Error al eliminar fecha');
    }
  };

  const actualizarFecha = async (fechaId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/actividades/${editingActivity._id}/fechas/${fechaId}`, editingFecha);
      setEditingFechas(editingFechas.map(f => f._id === fechaId ? response.data : f));
      setEditingFecha(null);
      toast.success('✅ Fecha actualizada');
    } catch (error) {
      toast.error(error.response?.data?.error || '❌ Error al actualizar fecha');
    }
  };

  const editarFechaLocal = (fecha) => {
    // Convertir el formato de la fecha al formato esperado por el estado de edición
    const riesgosParaEdicion = {
      bajo: { activo: false, precio: '' },
      medio: { activo: false, precio: '' },
      alto: { activo: false, precio: '' }
    };

    if (fecha.riesgos) {
      fecha.riesgos.forEach(r => {
        const nivelKey = r.nivel.toLowerCase();
        if (riesgosParaEdicion[nivelKey]) {
          riesgosParaEdicion[nivelKey] = {
            activo: true,
            precio: r.precio
          };
        }
      });
    }

    setEditingFecha({
      ...fecha,
      fechaInicio: fecha.fechaInicio ? fecha.fechaInicio.slice(0, 16) : '',
      fechaFin: fecha.fechaFin ? fecha.fechaFin.slice(0, 16) : '',
      riesgos: riesgosParaEdicion
    });
  };
  /*
    const crearActividad = async () => {
      if (!puedeCrear) return alert("No tienes permisos para crear actividades");
      if (newActivity.nivelesSeleccionados.length === 0) return alert("❌ Debes seleccionar al menos un nivel de riesgo");
      if (!newActivity.fecha_inicio || !newActivity.fecha_fin) return alert("❌ Debes especificar fechas y horas de inicio y fin");
      if (newActivity.capacidadMaxima <= 0) return alert("❌ La capacidad máxima debe ser mayor a 0");
      if (!newActivity.ubicacion.zona.trim()) return alert("❌ La zona es requerida");
      
      try {
        const nivelesConfigurados = newActivity.nivelesSeleccionados.map(nivel => ({
          riesgo: nivel,
          precio: newActivity.preciosPorNivel[nivel] || 0,
          recorrido: ""
        }));
  
        const datosActividad = {
          ...newActivity,
          nivelesConfigurados,
          duracion: newActivity.duracion || 0,
          capacidadMaxima: newActivity.capacidadMaxima || 1
        };
        delete datosActividad.nivelesSeleccionados;
        delete datosActividad.preciosPorNivel;
  
        const response = await axios.post(`${API_BASE_URL}/actividades/`, datosActividad);
        setActividades([...actividades, response.data]);
        setIsCreateModalOpen(false);
        resetNewActivity();
        alert("✅ Actividad creada correctamente");
      } catch (error) {
        alert(error.response?.data?.error || "❌ Error al crear actividad");
      }
    };*/

  // En la función crearActividad, elimina las validaciones que ya no corresponden
  const crearActividad = async () => {
    if (!puedeCrear) return toast.error("No tienes permisos para crear actividades");
    if (!newActivity.nombre.trim()) return toast.error("❌ El nombre es requerido");
    if (!newActivity.descripcion.trim()) return toast.error("❌ La descripción es requerida");
    if (!newActivity.ubicacion.zona.trim()) return toast.error("❌ La zona es requerida");

    try {
      // Ya no necesitas enviar nivelesConfigurados, fecha_inicio, fecha_fin, etc.
      const response = await axios.post(`${API_BASE_URL}/actividades/`, newActivity);
      setActividades([...actividades, response.data]);
      setIsCreateModalOpen(false);
      resetNewActivity();
      toast.success("✅ Actividad creada correctamente");
    } catch (error) {
      toast.error(error.response?.data?.error || "❌ Error al crear actividad");
    }
  };

  const editarActividad = async () => {
    if (!puedeEditar || !editingActivity) return;

    // Validaciones básicas
    if (!editingActivity.nombre?.trim()) {
      return toast.error("❌ El nombre es requerido");
    }
    if (!editingActivity.descripcion?.trim()) {
      return toast.error("❌ La descripción es requerida");
    }
    if (!editingActivity.ubicacion?.zona?.trim()) {
      return toast.error("❌ La zona es requerida");
    }
    // Si se está activando la actividad, verificar que tenga al menos una fecha configurada
    if (editingActivity.activo) {
      try {
        // Verificar si tiene fechas configuradas
        const fechasResponse = await axios.get(`${API_BASE_URL}/actividades/${editingActivity._id}/fechas`);
        const fechas = fechasResponse.data;

        if (!fechas || fechas.length === 0) {
          return toast.error("❌ No se puede activar la actividad porque no tiene ninguna fecha configurada. Debe agregar al menos una fecha en la pestaña 'Gestión de Fechas'.");
        }

        // Opcional: Verificar que tenga al menos una fecha activa
        const tieneFechaActiva = fechas.some(f => f.estado === 'activa');
        if (!tieneFechaActiva) {
          const continuar = confirm("⚠️ La actividad no tiene fechas activas. ¿Desea activarla de todas formas?");
          if (!continuar) return;
        }
      } catch (error) {
        console.error('Error verificando fechas:', error);
        return toast.error("❌ Error al verificar las fechas de la actividad");
      }
    }
    /*try {
      const datosActividad = {
        ...editingActivity,
        nivelesConfigurados,
        duracion: editingActivity.duracion || 0,
        capacidadMaxima: editingActivity.capacidadMaxima || 1
      };
      delete datosActividad.nivelesSeleccionados;
      delete datosActividad.preciosPorNivel;

      const response = await axios.put(`${API_BASE_URL}/actividades/${editingActivity._id}`, datosActividad);
      setActividades(actividades.map((act) => (act._id === editingActivity._id ? response.data : act)));
      setIsEditModalOpen(false);
      setEditingActivity(null);
      alert("✅ Actividad actualizada correctamente");
    } catch (error) {
      alert(error.response?.data?.error || "❌ Error al editar actividad");
    }*/

    try {
      // Preparar datos para enviar (sin nivelesConfigurados)
      const datosActividad = {
        nombre: editingActivity.nombre,
        descripcion: editingActivity.descripcion,
        recomendaciones: editingActivity.recomendaciones || '',
        enDescuento: !!editingActivity.enDescuento,
        descuento:   editingActivity.enDescuento ? (parseInt(editingActivity.descuento) || 0) : 0,
        tieneVip:    !!editingActivity.tieneVip,
        precioVip:   editingActivity.tieneVip ? (parseFloat(editingActivity.precioVip) || 0) : 0,
        multimedia: {
          imagenes:        sanitizeMultimediaArr(editingActivity.multimedia?.imagenes),
          videos:          sanitizeMultimediaArr(editingActivity.multimedia?.videos),
          panoramicas:     sanitizeMultimediaArr(editingActivity.multimedia?.panoramicas),
          videos360:       sanitizeMultimediaArr(editingActivity.multimedia?.videos360),
          audio:           sanitizeMultimediaArr(editingActivity.multimedia?.audio),
          enlacesInternos: sanitizeMultimediaArr(editingActivity.multimedia?.enlacesInternos),
        },
        ubicacion: editingActivity.ubicacion,
        activo: editingActivity.activo,
        categorias: editingActivity.categorias || [],
      };

      const response = await axios.put(`${API_BASE_URL}/actividades/${editingActivity._id}`, datosActividad);

      // Fusionar la respuesta con el estado actual para no perder precioDesde/nivelRiesgo/capacidadMaxima
      setActividades(actividades.map((act) =>
        act._id === editingActivity._id
          ? { ...act, ...response.data, enDescuento: datosActividad.enDescuento, descuento: datosActividad.descuento, tieneVip: datosActividad.tieneVip, precioVip: datosActividad.precioVip }
          : act
      ));

      setIsEditModalOpen(false);
      setEditingActivity(null);

      toast.success(editingActivity.activo
        ? "✅ Actividad activada correctamente"
        : "✅ Actividad desactivada correctamente"
      );
    } catch (error) {
      console.error('Error al editar actividad:', error);
      toast.error(error.response?.data?.error || "❌ Error al editar actividad");
    }
  };

  const eliminarActividad = async (actividad) => {
    if (!puedeEliminar) return toast.error("No tienes permisos para eliminar actividades");
    if (!confirm(`¿Eliminar "${actividad.nombre}"?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/actividades/${actividad._id}`);
      setActividades(actividades.filter((act) => act._id !== actividad._id));
      toast.success("✅ Actividad eliminada");
    } catch (error) {
      toast.error(error.response?.data?.error || "❌ Error al eliminar");
    }
  };

  const verActividadPorId = async (id) => {
    if (!puedeVer) return toast.error("No tienes permisos para ver detalles");
    try {
      const response = await axios.get(`${API_BASE_URL}/actividades/${id}`);
      setViewingActivity(response.data);

      try {
        const fechasResponse = await axios.get(`${API_BASE_URL}/actividades/${id}/fechas/rango`);
        setViewFechas(fechasResponse.data);
      } catch (error) {
        console.error("Error cargando fechas:", error);
        setViewFechas([]);
      }

      setIsViewModalOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.error || "Error al obtener detalles");
    }
  };

  const subirModelo3d = async (file, nombre) => {
    if (!editingActivity?._id) return;
    const formData = new FormData();
    formData.append('modelo', file);
    formData.append('nombre', nombre || file.name.replace(/\.[^.]+$/, ''));
    setSubiendo3d(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/multimedia/${editingActivity._id}/modelo3d`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setEditingActivity(prev => ({ ...prev, modelos3d: res.data.modelos3d }));
      setActividades(prev => prev.map(a =>
        a._id === editingActivity._id ? { ...a, modelos3d: res.data.modelos3d } : a
      ));
      toast.success('Modelo 3D subido correctamente');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al subir el modelo 3D');
    } finally {
      setSubiendo3d(false);
    }
  };

  const eliminarModelo3d = async (modeloId) => {
    if (!editingActivity?._id) return;
    if (!confirm('¿Eliminar este modelo 3D?')) return;
    try {
      const res = await axios.delete(`${API_BASE_URL}/multimedia/${editingActivity._id}/modelo3d/${modeloId}`);
      setEditingActivity(prev => ({ ...prev, modelos3d: res.data.modelos3d }));
      setActividades(prev => prev.map(a =>
        a._id === editingActivity._id ? { ...a, modelos3d: res.data.modelos3d } : a
      ));
      toast.success('Modelo 3D eliminado');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar el modelo 3D');
    }
  };

  const resetNewActivity = () => {
    setNewActivity({
      nombre: "",
      descripcion: "",
      recomendaciones: "",
      multimedia: { imagenes: [], videos: [], panoramicas: [], videos360: [], audio: [], enlacesInternos: [] },
      ubicacion: { zona: "", type: "Point", coordinates: [-68.1193, -16.4897] },
      categorias: [],
    });
    setNuevaCatNombre("");
    setNuevaCatIcono("🏔️");
  };

  const toggleCatEnForm = (id) => {
    setNewActivity(prev => ({
      ...prev,
      categorias: prev.categorias.includes(id)
        ? prev.categorias.filter(c => c !== id)
        : [...prev.categorias, id],
    }));
  };

  const crearCategoriaNueva = async () => {
    if (!nuevaCatNombre.trim()) return toast.error("Escribe un nombre para la categoría");
    setCreandoCategoria(true);
    try {
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ nombre: nuevaCatNombre.trim(), icono: nuevaCatIcono }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setTodasCategorias(prev => [...prev, data]);
      setNewActivity(prev => ({ ...prev, categorias: [...prev.categorias, data._id] }));
      setNuevaCatNombre("");
      setNuevaCatIcono("🏔️");
      toast.success(`Categoría "${data.nombre}" creada`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreandoCategoria(false);
    }
  };

  const calcularDuracion = (fecha_inicio, fecha_fin) => {
    if (!fecha_inicio || !fecha_fin) return 0;
    try {
      const inicio = new Date(fecha_inicio);
      const fin = new Date(fecha_fin);
      const diferenciaMilisegundos = fin - inicio;
      const diferenciasHoras = diferenciaMilisegundos / (1000 * 60 * 60);
      return Math.round(diferenciasHoras * 2) / 2;
    } catch (error) {
      return 0;
    }
  };

  // Normaliza un array multimedia: acepta strings, objetos válidos y objetos corruptos (char-indexed)
  const sanitizeMultimediaArr = (arr) =>
    (arr || []).map(item => {
      if (!item) return null;
      if (typeof item === "string" && item.trim()) return { url: item.trim(), title: "", description: "", order: 0, is_360: false };
      if (item.url) return item;
      const url = Object.entries(item)
        .filter(([k]) => /^\d+$/.test(k))
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([, v]) => v).join("");
      return url ? { url, title: item.title || "", description: item.description || "", order: item.order || 0, is_360: !!item.is_360 } : null;
    }).filter(Boolean);

  // Extrae la URL de un item multimedia sin importar el formato
  const getItemUrl = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    if (item.url) return item.url;
    // Objeto corrupto con keys numéricas (string spreadeado)
    return Object.entries(item)
      .filter(([k]) => /^\d+$/.test(k))
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, v]) => v).join("");
  };

  const handleMultimediaChange = (tipo, valor, isEditing = false) => {
    const source = isEditing ? editingActivity : newActivity;
    // Items actuales indexados por url para preservar metadatos (title, description, is_360, _id...)
    const existingByUrl = {};
    (source.multimedia?.[tipo] || []).forEach(item => {
      const u = getItemUrl(item);
      if (u) existingByUrl[u] = (item && typeof item === "object" && item.url) ? item : { url: u, title: "", description: "", order: 0, is_360: false };
    });

    const items = valor
      .split("\n")
      .map(u => u.trim())
      .filter(u => u !== "")
      .map(u => {
        const existing = existingByUrl[u];
        if (existing && typeof existing === "object") return existing;
        return { url: u, title: "", description: "", order: 0, is_360: false };
      });

    if (isEditing) {
      setEditingActivity(prev => ({ ...prev, multimedia: { ...prev.multimedia, [tipo]: items } }));
    } else {
      setNewActivity(prev => ({ ...prev, multimedia: { ...prev.multimedia, [tipo]: items } }));
    }
  };

  const actividadesFiltradas = actividades.filter(
    (actividad) =>
      actividad.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      actividad.descripcion.toLowerCase().includes(filtro.toLowerCase())
  );

  const getNivelRiesgoColor = (nivel) => {
    switch (nivel) {
      case "Alto":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medio":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Bajo":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatearRiesgosParaMostrar = (riesgos) => {
    if (!riesgos || riesgos.length === 0) return 'Ninguno';
    return riesgos.map(r => {
      const emoji = r.nivel === 'Bajo' ? '🟢' : r.nivel === 'Medio' ? '🟡' : '🔴';
      return `${emoji} ${r.nivel} Bs${r.precio}`;
    }).join(' • ');
  };

  if (!puedeCrear && !puedeListar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md border border-orange-200">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-orange-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Sin Permisos</h3>
          <p className="text-gray-600 text-center">
            No tienes los permisos necesarios para gestionar actividades. Contacta a un administrador.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Cargando actividades...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-2">
                  Gestión de Actividades
                </h1>
                <p className="text-gray-600">Administra las actividades de deportes extremos</p>
              </div>
              {puedeCrear && (
                <button
                  onClick={() => {
                    resetNewActivity();
                    setIsCreateModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus size={20} />
                  Nueva Actividad
                </button>
              )}
            </div>
          </div>

          {/* Búsqueda */}
          {puedeListar && (
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar actividad por nombre o descripción..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Tabla */}
          {puedeListar && (
            <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                      <th className="px-6 py-4 text-left font-semibold">#</th>
                      <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                      <th className="px-6 py-4 text-left font-semibold">Descripción</th>
                      <th className="px-6 py-4 text-left font-semibold">Zona</th>
                      <th className="px-6 py-4 text-left font-semibold">Estado</th>
                      <th className="px-6 py-4 text-left font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actividadesFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <Search className="text-gray-300 mb-3" size={48} />
                            <p className="text-lg font-medium">No se encontraron actividades</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      actividadesFiltradas.map((actividad, index) => (
                        <tr key={actividad._id} className="border-t border-gray-100 hover:bg-red-50 transition-colors">
                          <td className="px-6 py-4 text-gray-700 font-medium">{index + 1}</td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">{actividad.nombre}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-600 max-w-xs truncate" title={actividad.descripcion}>
                              {actividad.descripcion}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-600">{actividad.ubicacion?.zona || "N/D"}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${actividad.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                }`}
                            >
                              {actividad.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {puedeVer && (
                                <button
                                  onClick={() => verActividadPorId(actividad._id)}
                                  className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                  title="Ver detalles"
                                >
                                  <Eye size={16} />
                                </button>
                              )}
                              {puedeEditar && (
                                <button
                                  onClick={async () => {
                                    const nivelesConfigurados = actividad.nivelesConfigurados || [];
                                    const nivelesSeleccionados = nivelesConfigurados.map(n => n.riesgo);
                                    const preciosPorNivel = { "Bajo": 0, "Medio": 0, "Alto": 0 };
                                    nivelesConfigurados.forEach(n => {
                                      preciosPorNivel[n.riesgo] = n.precio;
                                    });

                                    const actividadConNiveles = {
                                      ...actividad,
                                      nivelesConfigurados,
                                      nivelesSeleccionados,
                                      preciosPorNivel,
                                      duracion: actividad.duracion || 0,
                                      capacidadMaxima: actividad.capacidadMaxima || 99,
                                      // Normalizar categorías: objetos → IDs
                                      categorias: (actividad.categorias || []).map(c =>
                                        typeof c === "object" ? c._id : c
                                      ),
                                    };
                                    setEditingActivity(actividadConNiveles);
                                    setIsEditModalOpen(true);
                                    await cargarFechas(actividad._id);
                                    setNuevaFecha({
                                      fechaInicio: '',
                                      fechaFin: '',
                                      capacidadDisponible: actividad.capacidadMaxima || 20,
                                      riesgos: {
                                        bajo: { activo: false, precio: '' },
                                        medio: { activo: false, precio: '' },
                                        alto: { activo: false, precio: '' }
                                      },
                                      estado: 'activa'
                                    });
                                    setEditingFecha(null);
                                  }}
                                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                  title="Editar"
                                >
                                  <Edit size={16} />
                                </button>
                              )}
                              {puedeEliminar && (
                                <button
                                  onClick={() => eliminarActividad(actividad)}
                                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Modelos 3D por Categoría ── */}
          {puedeEditar && (
            <Modelos3DCategoriasPanel
              categorias={todasCategorias}
              onUpdate={(catActualizada) =>
                setTodasCategorias(prev =>
                  prev.map(c => c._id === catActualizada._id ? { ...c, modelos3d: catActualizada.modelos3d } : c)
                )
              }
            />
          )}
        </div>
      </div>

      {/* MODAL CREAR */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-white">Crear Nueva Actividad</h3>
                <p className="text-green-100 text-sm">Complete la información de la actividad</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda - Info Básica */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="text-blue-600" size={18} />
                      </div>
                      Información Básica
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                        <input
                          type="text"
                          value={newActivity.nombre}
                          onChange={(e) => setNewActivity({ ...newActivity, nombre: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Ej: Rafting en La Paz"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción *</label>
                        <textarea
                          value={newActivity.descripcion}
                          onChange={(e) => setNewActivity({ ...newActivity, descripcion: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                          rows="4"
                          placeholder="Descripción detallada de la actividad"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Recomendaciones</label>
                        <textarea
                          value={newActivity.recomendaciones}
                          onChange={(e) => setNewActivity({ ...newActivity, recomendaciones: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                          rows="3"
                          placeholder="Recomendaciones de seguridad y equipamiento"
                        />
                      </div>

                      {/* ── Precio VIP ── */}
                      <div className={`border-2 rounded-xl p-4 transition-colors ${newActivity.tieneVip ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">👑</span>
                            <div>
                              <p className="text-sm font-semibold text-gray-700">Precio especial VIP</p>
                              <p className="text-xs text-gray-400">Precio fijo exclusivo para usuarios VIP</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewActivity(p => ({ ...p, tieneVip: !p.tieneVip, precioVip: p.tieneVip ? 0 : p.precioVip }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${newActivity.tieneVip ? 'bg-yellow-500' : 'bg-gray-300'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${newActivity.tieneVip ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                        {newActivity.tieneVip && (
                          <div className="mt-3">
                            <label className="block text-xs font-semibold text-yellow-700 mb-1">Precio VIP (Bs.)</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-yellow-600">Bs.</span>
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={newActivity.precioVip}
                                onChange={(e) => setNewActivity(p => ({ ...p, precioVip: parseFloat(e.target.value) || 0 }))}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white font-semibold text-gray-800"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ── Descuento ── */}
                      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Aplicar descuento</p>
                            <p className="text-xs text-gray-400">Se aplica sobre el precio por nivel de riesgo</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewActivity(p => ({ ...p, enDescuento: !p.enDescuento, descuento: p.enDescuento ? 0 : p.descuento }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${newActivity.enDescuento ? "bg-green-500" : "bg-gray-300"}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${newActivity.enDescuento ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </div>
                        {newActivity.enDescuento && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Porcentaje de descuento</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="range" min="1" max="99"
                                value={newActivity.descuento || 10}
                                onChange={(e) => setNewActivity(p => ({ ...p, descuento: parseInt(e.target.value) }))}
                                className="flex-1 accent-green-500"
                              />
                              <span className="w-14 text-center font-black text-green-600 text-lg">
                                {newActivity.descuento || 10}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ── Categorías ── */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          🏷️ Categoría <span className="text-red-500">*</span>
                        </label>

                        {/* Botones de categorías existentes */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {todasCategorias.map(cat => {
                            const sel = newActivity.categorias.includes(cat._id);
                            return (
                              <button
                                key={cat._id}
                                type="button"
                                onClick={() => toggleCatEnForm(cat._id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                  sel
                                    ? "bg-red-600 text-white border-red-600 shadow-sm"
                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-red-300"
                                }`}
                              >
                                <span>{cat.icono}</span>
                                {cat.nombre}
                                {sel && <span className="ml-0.5 text-xs">✓</span>}
                              </button>
                            );
                          })}
                          {todasCategorias.length === 0 && (
                            <p className="text-xs text-gray-400 italic">No hay categorías aún. Crea una abajo.</p>
                          )}
                        </div>

                        {/* Crear categoría nueva inline */}
                        <div className="border border-dashed border-gray-300 rounded-xl p-3 bg-gray-50">
                          <p className="text-xs font-semibold text-gray-500 mb-2">+ Nueva categoría</p>
                          <div className="flex gap-2 items-start">

                            {/* Selector de ícono */}
                            <div className="relative" ref={iconPickerRef}>
                              <button
                                type="button"
                                onClick={() => setIconPickerOpen(o => !o)}
                                className="w-11 h-9 border border-gray-300 rounded-lg text-xl flex items-center justify-center bg-white hover:border-red-400 transition focus:outline-none focus:ring-2 focus:ring-red-400"
                                title="Elegir ícono"
                              >
                                {nuevaCatIcono}
                              </button>

                              {iconPickerOpen && (
                                <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-64">
                                  <p className="text-xs font-semibold text-gray-500 mb-2">Elige un ícono</p>
                                  {ICON_GROUPS.map(group => (
                                    <div key={group.label} className="mb-2">
                                      <p className="text-xs text-gray-400 mb-1">{group.label}</p>
                                      <div className="flex flex-wrap gap-1">
                                        {group.icons.map(ic => (
                                          <button
                                            key={ic}
                                            type="button"
                                            onClick={() => { setNuevaCatIcono(ic); setIconPickerOpen(false); }}
                                            className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center hover:bg-red-50 transition ${
                                              nuevaCatIcono === ic ? "bg-red-100 ring-2 ring-red-400" : ""
                                            }`}
                                          >
                                            {ic}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <input
                              type="text"
                              value={nuevaCatNombre}
                              onChange={e => setNuevaCatNombre(e.target.value)}
                              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), crearCategoriaNueva())}
                              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                              placeholder="Ej: Escalada"
                            />
                            <button
                              type="button"
                              onClick={crearCategoriaNueva}
                              disabled={creandoCategoria || !nuevaCatNombre.trim()}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 whitespace-nowrap"
                            >
                              {creandoCategoria ? "…" : "Crear"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                        <div className="flex items-center h-[50px] px-4 border border-gray-300 rounded-xl">
                          <input
                            type="checkbox"
                            id="activo-create"
                            checked={newActivity.activo}
                            onChange={(e) => setNewActivity({ ...newActivity, activo: e.target.checked })}
                            className="w-5 h-5 text-green-600 focus:ring-green-500 rounded"
                          />
                          <label htmlFor="activo-create" className="ml-3 text-sm font-medium text-gray-700">
                            Actividad activa
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <MapPin className="text-red-600" size={18} />
                      </div>
                      Ubicación Geográfica
                    </h4>

                    <div className="space-y-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Zona * (ej: Coroico)</label>
                        <input
                          type="text"
                          value={newActivity.ubicacion.zona}
                          onChange={(e) => setNewActivity({
                            ...newActivity,
                            ubicacion: { ...newActivity.ubicacion, zona: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Coroico, La Paz"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Longitud *</label>
                          <input
                            type="number"
                            step="any"
                            value={newActivity.ubicacion.coordinates[0]}
                            onChange={(e) =>
                              setNewActivity({
                                ...newActivity,
                                ubicacion: {
                                  ...newActivity.ubicacion,
                                  coordinates: [parseFloat(e.target.value) || 0, newActivity.ubicacion.coordinates[1]],
                                },
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Latitud *</label>
                          <input
                            type="number"
                            step="any"
                            value={newActivity.ubicacion.coordinates[1]}
                            onChange={(e) =>
                              setNewActivity({
                                ...newActivity,
                                ubicacion: {
                                  ...newActivity.ubicacion,
                                  coordinates: [newActivity.ubicacion.coordinates[0], parseFloat(e.target.value) || 0],
                                },
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setMapModalFor("create");
                        setShowMapModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-orange-700 transition-all"
                    >
                      <MapPin size={20} />
                      Seleccionar en mapa
                    </button>
                  </div>
                </div>

                {/* Columna Derecha - Multimedia */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Image className="text-purple-600" size={18} />
                      </div>
                      Multimedia
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Image size={16} />
                          Imágenes (URLs)
                        </label>
                        <textarea
                          value={newActivity.multimedia.imagenes.join("\n")}
                          onChange={(e) => handleMultimediaChange("imagenes", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-mono"
                          rows="3"
                          placeholder="https://ejemplo.com/imagen1.jpg&#10;https://ejemplo.com/imagen2.jpg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Video size={16} />
                          Videos (URLs)
                        </label>
                        <textarea
                          value={newActivity.multimedia.videos.join("\n")}
                          onChange={(e) => handleMultimediaChange("videos", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-mono"
                          rows="2"
                          placeholder="https://ejemplo.com/video1.mp4"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Music size={16} />
                          Audio (URLs)
                        </label>
                        <textarea
                          value={newActivity.multimedia.audio.join("\n")}
                          onChange={(e) => handleMultimediaChange("audio", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-mono"
                          rows="2"
                          placeholder="https://ejemplo.com/audio1.mp3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Image size={16} />
                          Panorámicas (URLs)
                        </label>
                        <textarea
                          value={newActivity.multimedia.panoramicas.join("\n")}
                          onChange={(e) => handleMultimediaChange("panoramicas", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-mono"
                          rows="2"
                          placeholder="https://ejemplo.com/panoramica1.jpg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Globe size={16} />
                          Videos 360° (URLs)
                        </label>
                        <textarea
                          value={newActivity.multimedia.videos360.join("\n")}
                          onChange={(e) => handleMultimediaChange("videos360", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-mono"
                          rows="2"
                          placeholder="https://ejemplo.com/video360.mp4"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Link size={16} />
                          Enlaces Internos (URLs)
                        </label>
                        <textarea
                          value={newActivity.multimedia.enlacesInternos.join("\n")}
                          onChange={(e) => handleMultimediaChange("enlacesInternos", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-mono"
                          rows="2"
                          placeholder="https://ejemplo.com/enlace1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">*</span> Campos obligatorios
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={crearActividad}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center gap-2"
                >
                  <Save size={20} />
                  Crear Actividad
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FIN MODAL CREAR----------------------------------------------------------------- */}

      {/* MODAL EDITAR - Versión mejorada con gestión de fechas */}
      {isEditModalOpen && editingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header (sin cambios) */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-white">Editar Actividad</h3>
                <p className="text-blue-100 text-sm">Modificar "{editingActivity.nombre}"</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Pestañas */}
            <div className="bg-gray-100 px-6 py-2 flex gap-2 border-b border-gray-200 shrink-0">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 font-semibold rounded-lg transition-colors ${activeTab === 'info'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Información de la Actividad
              </button>
              <button
                onClick={() => setActiveTab('fechas')}
                className={`px-4 py-2 font-semibold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'fechas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Calendar size={16} />
                Gestión de Fechas
              </button>
              <button
                onClick={() => setActiveTab('poligonos')}
                className={`px-4 py-2 font-semibold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'poligonos'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <MapPin size={16} />
                Polígonos de Riesgo
              </button>
            </div>


            {/* Content - Condicional según pestaña */}
            {activeTab === 'info' && (
              /* Pestaña de Información de la Actividad - VERSIÓN SIMPLIFICADA */
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Columna Izquierda */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Información Básica</h4>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                          <input
                            type="text"
                            value={editingActivity.nombre}
                            onChange={(e) => setEditingActivity({ ...editingActivity, nombre: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción *</label>
                          <textarea
                            value={editingActivity.descripcion}
                            onChange={(e) => setEditingActivity({ ...editingActivity, descripcion: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="4"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Recomendaciones</label>
                          <textarea
                            value={editingActivity.recomendaciones || ""}
                            onChange={(e) => setEditingActivity({ ...editingActivity, recomendaciones: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                          />
                        </div>

                        {/* ── Precio VIP (edición) ── */}
                        <div className={`border-2 rounded-xl p-4 transition-colors ${editingActivity.tieneVip ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">👑</span>
                              <div>
                                <p className="text-sm font-semibold text-gray-700">Precio especial VIP</p>
                                <p className="text-xs text-gray-400">Precio fijo exclusivo para usuarios VIP</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingActivity(p => ({ ...p, tieneVip: !p.tieneVip, precioVip: p.tieneVip ? 0 : (p.precioVip || 0) }))}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editingActivity.tieneVip ? 'bg-yellow-500' : 'bg-gray-300'}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${editingActivity.tieneVip ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                          {editingActivity.tieneVip && (
                            <div className="mt-3">
                              <label className="block text-xs font-semibold text-yellow-700 mb-1">Precio VIP (Bs.)</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-yellow-600">Bs.</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={editingActivity.precioVip || 0}
                                  onChange={(e) => setEditingActivity(p => ({ ...p, precioVip: parseFloat(e.target.value) || 0 }))}
                                  className="w-full pl-10 pr-4 py-2.5 border-2 border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white font-semibold text-gray-800"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ── Descuento (edición) ── */}
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-700">Aplicar descuento</p>
                              <p className="text-xs text-gray-400">Se aplica sobre el precio por nivel de riesgo</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingActivity(p => ({ ...p, enDescuento: !p.enDescuento, descuento: p.enDescuento ? 0 : (p.descuento || 10) }))}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editingActivity.enDescuento ? "bg-blue-500" : "bg-gray-300"}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${editingActivity.enDescuento ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                          </div>
                          {editingActivity.enDescuento && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Porcentaje de descuento</label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="range" min="1" max="99"
                                  value={editingActivity.descuento || 10}
                                  onChange={(e) => setEditingActivity(p => ({ ...p, descuento: parseInt(e.target.value) }))}
                                  className="flex-1 accent-blue-500"
                                />
                                <span className="w-14 text-center font-black text-blue-600 text-lg">
                                  {editingActivity.descuento || 10}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ── Modelos 3D (edición) ── */}
                        <Modelos3DEditor
                          modelos={editingActivity.modelos3d || []}
                          subiendo={subiendo3d}
                          inputRef={modelo3dInputRef}
                          onSubir={subirModelo3d}
                          onEliminar={eliminarModelo3d}
                        />

                        {/* ── Categorías (edición) ── */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">🏷️ Categoría</label>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {todasCategorias.map(cat => {
                              const sel = (editingActivity.categorias || []).includes(cat._id);
                              return (
                                <button
                                  key={cat._id}
                                  type="button"
                                  onClick={() =>
                                    setEditingActivity(prev => ({
                                      ...prev,
                                      categorias: sel
                                        ? prev.categorias.filter(id => id !== cat._id)
                                        : [...(prev.categorias || []), cat._id],
                                    }))
                                  }
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                    sel
                                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
                                  }`}
                                >
                                  <span>{cat.icono}</span>
                                  {cat.nombre}
                                  {sel && <span className="ml-0.5 text-xs">✓</span>}
                                </button>
                              );
                            })}
                            {todasCategorias.length === 0 && (
                              <p className="text-xs text-gray-400 italic">No hay categorías.</p>
                            )}
                          </div>

                          {/* Crear categoría nueva inline (edit) */}
                          <div className="border border-dashed border-gray-300 rounded-xl p-3 bg-gray-50">
                            <p className="text-xs font-semibold text-gray-500 mb-2">+ Nueva categoría</p>
                            <div className="flex gap-2 items-start">
                              <div className="relative" ref={iconPickerRefEdit}>
                                <button
                                  type="button"
                                  onClick={() => setIconPickerOpenEdit(o => !o)}
                                  className="w-11 h-9 border border-gray-300 rounded-lg text-xl flex items-center justify-center bg-white hover:border-blue-400 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                  {nuevaCatIcono}
                                </button>
                                {iconPickerOpenEdit && (
                                  <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-64">
                                    <p className="text-xs font-semibold text-gray-500 mb-2">Elige un ícono</p>
                                    {ICON_GROUPS.map(group => (
                                      <div key={group.label} className="mb-2">
                                        <p className="text-xs text-gray-400 mb-1">{group.label}</p>
                                        <div className="flex flex-wrap gap-1">
                                          {group.icons.map(ic => (
                                            <button
                                              key={ic}
                                              type="button"
                                              onClick={() => { setNuevaCatIcono(ic); setIconPickerOpenEdit(false); }}
                                              className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center hover:bg-blue-50 transition ${
                                                nuevaCatIcono === ic ? "bg-blue-100 ring-2 ring-blue-400" : ""
                                              }`}
                                            >
                                              {ic}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <input
                                type="text"
                                value={nuevaCatNombre}
                                onChange={e => setNuevaCatNombre(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), crearCategoriaNueva())}
                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Ej: Escalada"
                              />
                              <button
                                type="button"
                                onClick={crearCategoriaNueva}
                                disabled={creandoCategoria || !nuevaCatNombre.trim()}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap"
                              >
                                {creandoCategoria ? "…" : "Crear"}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                          <div className="flex items-center h-[50px] px-4 border border-gray-300 rounded-xl">
                            <input
                              type="checkbox"
                              id="activo-edit"
                              checked={editingActivity.activo}
                              onChange={(e) => setEditingActivity({ ...editingActivity, activo: e.target.checked })}
                              className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                            />
                            <label htmlFor="activo-edit" className="ml-3 text-sm font-medium text-gray-700">
                              Actividad activa
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ubicación → gestionada directamente en la pestaña "Polígonos de Riesgo" */}
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <MapPin className="text-orange-600" size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-orange-800 mb-0.5">Ubicación geográfica</p>
                        <p className="text-xs text-orange-700 leading-relaxed">
                          La zona, latitud y longitud de la actividad se gestionan en la pestaña{' '}
                          <button
                            type="button"
                            onClick={() => setActiveTab('poligonos')}
                            className="font-bold underline hover:text-orange-900 transition-colors"
                          >
                            Polígonos de Riesgo
                          </button>
                          . Usa el marcador rojo del mapa o el botón <strong>"Ubicar"</strong> para actualizar las coordenadas.
                        </p>
                        {editingActivity.ubicacion?.zona && (
                          <p className="mt-2 text-xs text-orange-800">
                            📍 Zona actual: <span className="font-semibold">{editingActivity.ubicacion.zona}</span>
                            {editingActivity.ubicacion.coordinates && (
                              <span className="ml-2 font-mono text-gray-500">
                                ({editingActivity.ubicacion.coordinates[1]?.toFixed(4)}, {editingActivity.ubicacion.coordinates[0]?.toFixed(4)})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha - Multimedia */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Multimedia</h4>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Imágenes</label>
                          <textarea
                            value={editingActivity.multimedia?.imagenes?.map(getItemUrl).join("\n") || ""}
                            onChange={(e) => handleMultimediaChange("imagenes", e.target.value, true)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                            rows="3"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Videos</label>
                          <textarea
                            value={editingActivity.multimedia?.videos?.map(getItemUrl).join("\n") || ""}
                            onChange={(e) => handleMultimediaChange("videos", e.target.value, true)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                            rows="2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Audio</label>
                          <textarea
                            value={editingActivity.multimedia?.audio?.map(getItemUrl).join("\n") || ""}
                            onChange={(e) => handleMultimediaChange("audio", e.target.value, true)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                            rows="2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Panorámicas</label>
                          <textarea
                            value={editingActivity.multimedia?.panoramicas?.map(getItemUrl).join("\n") || ""}
                            onChange={(e) => handleMultimediaChange("panoramicas", e.target.value, true)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                            rows="2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Videos 360°</label>
                          <textarea
                            value={editingActivity.multimedia?.videos360?.map(getItemUrl).join("\n") || ""}
                            onChange={(e) => handleMultimediaChange("videos360", e.target.value, true)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                            rows="2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Enlaces</label>
                          <textarea
                            value={editingActivity.multimedia?.enlacesInternos?.map(getItemUrl).join("\n") || ""}
                            onChange={(e) => handleMultimediaChange("enlacesInternos", e.target.value, true)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                            rows="2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              /*--------------------------------------------------------------------------------------------- */
            )}
            {activeTab === 'fechas' && (
              /* Pestaña de Gestión de Fechas - nuevo componente */
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <GestionFechas
                  actividadId={editingActivity._id}
                  actividad={editingActivity}
                />
              </div>
            )}
            {activeTab === 'poligonos' && (
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <PoligonoEditor
                  actividad={editingActivity}
                  onUbicacionChange={({ type, coordinates, zona }) => {
                    setEditingActivity(prev => ({
                      ...prev,
                      ubicacion: {
                        ...prev.ubicacion,
                        ...(type        !== undefined && { type }),
                        ...(coordinates !== undefined && { coordinates }),
                        ...(zona        !== undefined && { zona }),
                      },
                    }));
                  }}
                />
              </div>
            )}

            {/* Footer - Siempre visible */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              {activeTab === 'info' && (
                <button
                  onClick={editarActividad}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2"
                >
                  <Check size={20} />
                  Guardar Cambios de Actividad
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* -------------------------------------------MODAL FINAL EDITAR --------------------------------------------------*/}
      {/* MODAL VER */}
      {isViewModalOpen && viewingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-white">Detalles de la Actividad</h3>
                <p className="text-gray-300 text-sm">"{viewingActivity.nombre}"</p>
              </div>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingActivity(null);
                  setViewFechas([]);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Información Principal</h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Nombre</label>
                        <p className="text-gray-900 font-medium">{viewingActivity.nombre}</p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Zona</label>
                        <p className="text-gray-900 font-medium">{viewingActivity.ubicacion?.zona || "N/D"}</p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Niveles de Riesgo</label>
                        <div className="flex flex-wrap gap-2">
                          {viewingActivity.nivelesConfigurados?.map((nivel, idx) => (
                            <span
                              key={idx}
                              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getNivelRiesgoColor(nivel.riesgo)}`}
                            >
                              {nivel.riesgo} - Bs {nivel.precio}
                            </span>
                          ))}
                          {(!viewingActivity.nivelesConfigurados || viewingActivity.nivelesConfigurados.length === 0) && (
                            <span className="text-gray-500">No configurado</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Estado</label>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${viewingActivity.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {viewingActivity.activo ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Capacidad Máxima</label>
                        <p className="text-gray-900 font-medium">{viewingActivity.capacidadMaxima} personas</p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Duración</label>
                        <p className="text-gray-900 font-medium">{viewingActivity.duracion || "N/D"} horas</p>
                      </div>

                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Fechas programadas</label>
                        <p className="text-gray-900 text-sm">
                          Inicio: {viewingActivity.fecha_inicio ? new Date(viewingActivity.fecha_inicio).toLocaleString() : "N/D"}
                        </p>
                        <p className="text-gray-900 text-sm">
                          Fin: {viewingActivity.fecha_fin ? new Date(viewingActivity.fecha_fin).toLocaleString() : "N/D"}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Descripción</label>
                        <p className="text-gray-900 text-sm leading-relaxed">{viewingActivity.descripcion}</p>
                      </div>

                      {viewingActivity.recomendaciones && (
                        <div className="col-span-2">
                          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                            Recomendaciones
                          </label>
                          <p className="text-gray-900 text-sm leading-relaxed bg-blue-50 p-3 rounded-lg">
                            {viewingActivity.recomendaciones}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Ubicación Geográfica</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Zona</label>
                        <p className="text-gray-900 font-medium">{viewingActivity.ubicacion?.zona || "N/D"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Latitud</label>
                        <p className="text-gray-900 font-mono text-sm">
                          {viewingActivity.ubicacion?.coordinates?.[1]?.toFixed(6) || "N/D"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Longitud</label>
                        <p className="text-gray-900 font-mono text-sm">
                          {viewingActivity.ubicacion?.coordinates?.[0]?.toFixed(6) || "N/D"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fechas adicionales */}
                  {viewFechas.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-blue-600" />
                        Fechas Adicionales
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-2 text-left text-xs">Fecha</th>
                              <th className="px-4 py-2 text-left text-xs">Nivel</th>
                              <th className="px-4 py-2 text-left text-xs">Precio</th>
                              <th className="px-4 py-2 text-left text-xs">Capacidad</th>
                              <th className="px-4 py-2 text-left text-xs">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {viewFechas.map((fecha) => (
                              <tr key={fecha._id} className="border-t border-gray-200">
                                <td className="px-4 py-2 text-sm">{new Date(fecha.fechaInicio || fecha.fecha).toLocaleString()}</td>
                                <td className="px-4 py-2">
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getNivelRiesgoColor(fecha.nivelRiesgo || fecha.riesgos?.[0]?.nivel)}`}>
                                    {fecha.nivelRiesgo || fecha.riesgos?.[0]?.nivel || 'N/D'}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm">Bs {fecha.precio || fecha.riesgos?.[0]?.precio || 'N/D'}</td>
                                <td className="px-4 py-2 text-sm">{fecha.capacidadDisponible}</td>
                                <td className="px-4 py-2">
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${fecha.estado === 'activa' || fecha.estado === 'Disponible' ? 'bg-green-100 text-green-700' :
                                    fecha.estado === 'inactiva' || fecha.estado === 'Ocupado' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                    {fecha.estado}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Columna Derecha - Multimedia */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Multimedia</h4>

                    <div className="space-y-4">
                      {viewingActivity.multimedia?.imagenes?.length > 0 && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block flex items-center gap-2">
                            <Image size={14} />
                            Imágenes
                          </label>
                          <div className="space-y-1 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-lg">
                            {viewingActivity.multimedia.imagenes.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 hover:underline text-sm truncate">
                                Imagen {i + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {viewingActivity.multimedia?.videos?.length > 0 && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block flex items-center gap-2">
                            <Video size={14} />
                            Videos
                          </label>
                          <div className="space-y-1 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-lg">
                            {viewingActivity.multimedia.videos.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 hover:underline text-sm truncate">
                                Video {i + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {viewingActivity.multimedia?.audio?.length > 0 && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block flex items-center gap-2">
                            <Music size={14} />
                            Audio
                          </label>
                          <div className="space-y-1 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-lg">
                            {viewingActivity.multimedia.audio.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 hover:underline text-sm truncate">
                                Audio {i + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {viewingActivity.multimedia?.panoramicas?.length > 0 && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block flex items-center gap-2">
                            <Image size={14} />
                            Panorámicas
                          </label>
                          <div className="space-y-1 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-lg">
                            {viewingActivity.multimedia.panoramicas.map((item, i) => {
                              const url = typeof item === "string" ? item : item.url;
                              return (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 hover:underline text-sm truncate">
                                  Panorámica {i + 1}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}


                      {viewingActivity.multimedia?.videos360?.length > 0 && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block flex items-center gap-2">
                            <Globe size={14} />
                            Videos 360
                          </label>
                          <div className="space-y-1 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-lg">
                            {viewingActivity.multimedia.videos360.map((item, i) => {
                              const url = typeof item === "string" ? item : item.url;
                              return (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 hover:underline text-sm truncate">
                                  Video 360 {i + 1}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {viewingActivity.multimedia?.enlacesInternos?.length > 0 && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block flex items-center gap-2">
                            <Link size={14} />
                            Enlaces
                          </label>
                          <div className="space-y-1 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-lg">
                            {viewingActivity.multimedia.enlacesInternos.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 hover:underline text-sm truncate">
                                Enlace {i + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {(!viewingActivity.multimedia || Object.values(viewingActivity.multimedia).every((arr) => !arr || arr.length === 0)) && (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Image className="text-gray-400" size={32} />
                          </div>
                          <p className="text-gray-500 text-sm">Sin contenido multimedia</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end shrink-0">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingActivity(null);
                  setViewFechas([]);
                }}
                className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Mapa */}
      {showMapModal && (
        <MapPickerModal
          isOpen={showMapModal}
          onClose={() => {
            setShowMapModal(false);
            setMapModalFor(null);
          }}
          initialLng={
            mapModalFor === "create"
              ? newActivity.ubicacion.coordinates[0]
              : editingActivity?.ubicacion?.coordinates[0] || -68.1193
          }
          initialLat={
            mapModalFor === "create"
              ? newActivity.ubicacion.coordinates[1]
              : editingActivity?.ubicacion?.coordinates[1] || -16.4897
          }
          onSelectLocation={(lng, lat) => {
            if (mapModalFor === "create") {
              setNewActivity((prev) => ({
                ...prev,
                ubicacion: { ...prev.ubicacion, coordinates: [lng, lat] },
              }));
            } else if (mapModalFor === "edit" && editingActivity) {
              setEditingActivity((prev) => ({
                ...prev,
                ubicacion: { ...prev.ubicacion, coordinates: [lng, lat] },
              }));
            }
            setShowMapModal(false);
            setMapModalFor(null);
          }}
        />
      )}

      {/* Animaciones CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}