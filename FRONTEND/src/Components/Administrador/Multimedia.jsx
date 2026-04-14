"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import toast from "../../utils/toast";

const API_BASE_URL = "/api";

// Axios interceptor: attach auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const TIPOS_MULTIMEDIA = [
  { key: "imagenes",        label: "Imágenes",        icon: "🖼️" },
  { key: "videos",          label: "Videos",           icon: "🎥" },
  { key: "panoramicas",     label: "Panorámicas",      icon: "🌄" },
  { key: "videos360",       label: "Videos 360°",      icon: "🌐" },
  { key: "audio",           label: "Audio",            icon: "🎵" },
  { key: "enlacesInternos", label: "Enlaces",          icon: "🔗" },
];

const EMPTY_MULTIMEDIA = {
  imagenes: [], videos: [], panoramicas: [],
  videos360: [], audio: [], enlacesInternos: [],
};

const EMPTY_FORM = {
  modoArchivo: false,
  url: "",
  archivo: null,
  title: "",
  description: "",
  is_360: false,
};

// ─── MediaCard ─────────────────────────────────────────────────────────────────
const MediaCard = ({ tipo, item, index, total, onDelete, onMoveUp, onMoveDown, onEdit, canDelete, canEdit }) => {
  const url = item.url || "";
  const isUpload = url.startsWith("uploads/");
  const displayUrl = isUpload ? `/${url}` : url;

  const renderPreview = () => {
    if (tipo === "imagenes" || tipo === "panoramicas") {
      return (
        <img
          src={displayUrl || "/placeholder.svg"}
          alt={item.title || "Imagen"}
          className="w-full h-36 object-cover rounded-t-lg"
          onError={(e) => { e.target.src = "/placeholder.svg"; }}
        />
      );
    }
    if (tipo === "videos" || tipo === "videos360") {
      const isYt = /youtu/.test(url);
      if (isYt) {
        const ytId = url.match(/(?:youtu\.be\/|v=|embed\/)([^#&?]{11})/)?.[1];
        return (
          <div className="w-full h-36 bg-gray-900 rounded-t-lg flex items-center justify-center">
            <span className="text-4xl">▶️</span>
            {ytId && <img src={`https://img.youtube.com/vi/${ytId}/0.jpg`} alt="thumb" className="absolute inset-0 w-full h-36 object-cover rounded-t-lg opacity-60" />}
          </div>
        );
      }
      return (
        <video className="w-full h-36 object-cover rounded-t-lg bg-gray-900" preload="metadata">
          <source src={displayUrl} />
        </video>
      );
    }
    if (tipo === "audio") {
      return (
        <div className="w-full h-36 bg-gradient-to-br from-red-50 to-red-100 rounded-t-lg flex flex-col items-center justify-center gap-2">
          <span className="text-4xl">🎵</span>
          <audio controls className="w-full px-2">
            <source src={displayUrl} />
          </audio>
        </div>
      );
    }
    if (tipo === "enlacesInternos") {
      return (
        <div className="w-full h-36 bg-gradient-to-br from-blue-50 to-blue-100 rounded-t-lg flex flex-col items-center justify-center gap-2">
          <span className="text-4xl">🔗</span>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs underline truncate max-w-full px-2">
            {url}
          </a>
        </div>
      );
    }
    return <div className="w-full h-36 bg-gray-100 rounded-t-lg flex items-center justify-center"><span className="text-gray-400">Sin vista previa</span></div>;
  };

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm group overflow-hidden">
      <div className="relative">{renderPreview()}</div>

      {/* Badges */}
      {item.is_360 && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">360°</div>
      )}

      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {canEdit && (
          <button onClick={() => onEdit(item)} title="Editar" className="bg-white border border-gray-200 rounded-full w-7 h-7 flex items-center justify-center text-gray-700 hover:bg-yellow-50 hover:border-yellow-300 shadow-sm">
            ✏️
          </button>
        )}
        {canDelete && (
          <button onClick={() => onDelete(item._id)} title="Eliminar" className="bg-white border border-gray-200 rounded-full w-7 h-7 flex items-center justify-center text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm">
            ×
          </button>
        )}
      </div>

      {/* Reorder arrows */}
      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onMoveUp(index)} disabled={index === 0} className="bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-30 shadow-sm">
          ▲
        </button>
        <button onClick={() => onMoveDown(index)} disabled={index === total - 1} className="bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-30 shadow-sm">
          ▼
        </button>
      </div>

      {/* Title/info footer */}
      <div className="px-3 py-2 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-800 truncate">{item.title || <span className="text-gray-400 italic">Sin título</span>}</p>
        {item.description && <p className="text-xs text-gray-500 truncate">{item.description}</p>}
        <p className="text-xs text-gray-400 truncate mt-0.5" title={url}>{url}</p>
      </div>
    </div>
  );
};

// ─── EditModal ──────────────────────────────────────────────────────────────────
const EditModal = ({ item, tipo, onClose, onSave }) => {
  const [title, setTitle] = useState(item.title || "");
  const [description, setDescription] = useState(item.description || "");
  const [is_360, setIs360] = useState(item.is_360 || false);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Editar metadatos</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Título del elemento" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Descripción opcional" />
          </div>
          {(tipo === "imagenes" || tipo === "panoramicas") && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={is_360} onChange={(e) => setIs360(e.target.checked)} className="w-4 h-4 accent-red-600" />
              <span className="text-sm text-gray-700">Imagen 360°</span>
            </label>
          )}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => onSave({ title, description, is_360 })} className="flex-1 bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition">
            Guardar
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-200 transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function MultimediaConPermisos() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [actividades, setActividades] = useState([]);
  const [actividadSeleccionada, setActividadSeleccionada] = useState("");
  const [multimedia, setMultimedia] = useState(EMPTY_MULTIMEDIA);
  const [loading, setLoading] = useState(false);
  const [tabActivo, setTabActivo] = useState("imagenes");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const puedeCrear   = user?.permisos?.includes("crear_multimedia");
  const puedeVer     = user?.permisos?.includes("ver_multimedia");
  const puedeEliminar = user?.permisos?.includes("eliminar_multimedia");
  const puedeListar  = user?.permisos?.includes("listar_actividades");

  // ── Load actividades
  useEffect(() => {
    if (puedeListar) cargarActividades();
  }, [puedeListar]);

  // ── Load multimedia on activity change
  useEffect(() => {
    if (actividadSeleccionada && puedeVer) cargarMultimedia();
  }, [actividadSeleccionada, puedeVer]);

  const cargarActividades = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/actividades`);
      setActividades(res.data);
    } catch (err) {
      toast.error("Error al cargar actividades");
    }
  };

  const cargarMultimedia = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/multimedia/${actividadSeleccionada}`);
      setMultimedia({ ...EMPTY_MULTIMEDIA, ...res.data });
    } catch (err) {
      toast.error("Error al cargar multimedia");
    } finally {
      setLoading(false);
    }
  };

  // ── Add
  const handleAgregar = async () => {
    if (!actividadSeleccionada) return toast.error("Seleccione una actividad");
    if (!form.modoArchivo && !form.url.trim()) return toast.error("Ingrese una URL válida");
    if (form.modoArchivo && !form.archivo) return toast.error("Seleccione un archivo");

    try {
      setSubmitting(true);
      let res;
      if (form.modoArchivo) {
        const fd = new FormData();
        fd.append("archivo", form.archivo);
        fd.append("tipo", tabActivo);
        fd.append("title", form.title);
        fd.append("description", form.description);
        fd.append("is_360", form.is_360 ? "true" : "false");
        fd.append("order", multimedia[tabActivo]?.length || 0);
        res = await axios.post(`${API_BASE_URL}/multimedia/${actividadSeleccionada}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post(`${API_BASE_URL}/multimedia/${actividadSeleccionada}`, {
          tipo: tabActivo,
          url: form.url.trim(),
          title: form.title,
          description: form.description,
          is_360: form.is_360,
          order: multimedia[tabActivo]?.length || 0,
        });
      }
      setMultimedia({ ...EMPTY_MULTIMEDIA, ...res.data });
      setForm(EMPTY_FORM);
      setMostrarFormulario(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Multimedia agregada correctamente");
    } catch (err) {
      toast.error(err.response?.data?.error || "Error al agregar multimedia");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete
  const handleEliminar = async (itemId) => {
    if (!confirm("¿Eliminar este elemento?")) return;
    try {
      const res = await axios.delete(`${API_BASE_URL}/multimedia/${actividadSeleccionada}`, {
        data: { tipo: tabActivo, itemId },
      });
      setMultimedia({ ...EMPTY_MULTIMEDIA, ...res.data });
      toast.success("Elemento eliminado");
    } catch (err) {
      toast.error(err.response?.data?.error || "Error al eliminar");
    }
  };

  // ── Reorder (up/down)
  const handleMove = async (index, direction) => {
    const items = [...(multimedia[tabActivo] || [])];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    const reordered = items.map((it, i) => ({ ...it, order: i }));
    // Optimistic update
    setMultimedia((prev) => ({ ...prev, [tabActivo]: reordered }));
    try {
      const res = await axios.put(`${API_BASE_URL}/multimedia/${actividadSeleccionada}/reordenar`, {
        tipo: tabActivo,
        items: reordered.map((it) => ({ _id: it._id, order: it.order })),
      });
      setMultimedia({ ...EMPTY_MULTIMEDIA, ...res.data });
    } catch (err) {
      toast.error("Error al reordenar");
      cargarMultimedia();
    }
  };

  // ── Edit metadata
  const handleSaveEdit = async ({ title, description, is_360 }) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/multimedia/${actividadSeleccionada}/item`, {
        tipo: tabActivo,
        itemId: editItem._id,
        title,
        description,
        is_360,
      });
      setMultimedia({ ...EMPTY_MULTIMEDIA, ...res.data });
      setEditItem(null);
      toast.success("Metadatos actualizados");
    } catch (err) {
      toast.error("Error al actualizar metadatos");
    }
  };

  // ── Permissions guard
  if (!puedeVer && !puedeCrear && !puedeEliminar) {
    return (
      <section className="p-6">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-orange-600 text-xl">⚠️</span>
          <span className="text-orange-700">No tienes los permisos necesarios para gestionar contenido multimedia.</span>
        </div>
      </section>
    );
  }

  const itemsActivos = multimedia[tabActivo] || [];

  return (
    <section className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestión Multimedia</h2>
        {actividadSeleccionada && puedeCrear && (
          <button
            onClick={() => { setMostrarFormulario((v) => !v); setForm(EMPTY_FORM); }}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            {mostrarFormulario ? "✕ Cerrar" : "+ Agregar"}
          </button>
        )}
      </div>

      {/* Activity selector */}
      {puedeListar ? (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Actividad</label>
          <select
            value={actividadSeleccionada}
            onChange={(e) => { setActividadSeleccionada(e.target.value); setMostrarFormulario(false); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">-- Seleccione una actividad --</option>
            {actividades.map((a) => (
              <option key={a._id} value={a._id}>{a.nombre}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-700 text-sm">No tienes permisos para listar actividades.</p>
        </div>
      )}

      {actividadSeleccionada && puedeVer && (
        <>
          {/* Add form */}
          {mostrarFormulario && puedeCrear && (
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h4 className="font-semibold text-gray-800 mb-4">Agregar contenido — {TIPOS_MULTIMEDIA.find((t) => t.key === tabActivo)?.icon} {TIPOS_MULTIMEDIA.find((t) => t.key === tabActivo)?.label}</h4>

              {/* URL / File toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setForm((f) => ({ ...f, modoArchivo: false, archivo: null }))}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${!form.modoArchivo ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700 border-gray-300 hover:border-red-400"}`}
                >
                  🔗 URL
                </button>
                <button
                  onClick={() => setForm((f) => ({ ...f, modoArchivo: true, url: "" }))}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${form.modoArchivo ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700 border-gray-300 hover:border-red-400"}`}
                >
                  📁 Subir archivo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  {form.modoArchivo ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Archivo (imagen, video o audio)</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*,audio/*"
                        onChange={(e) => setForm((f) => ({ ...f, archivo: e.target.files[0] || null }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                      <input
                        type="url"
                        value={form.url}
                        onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                        placeholder="https://ejemplo.com/archivo.jpg"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Título del elemento"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Descripción opcional"
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>

                {(tabActivo === "imagenes" || tabActivo === "panoramicas") && (
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.is_360}
                        onChange={(e) => setForm((f) => ({ ...f, is_360: e.target.checked }))}
                        className="w-4 h-4 accent-red-600"
                      />
                      <span className="text-sm text-gray-700">Imagen 360°</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAgregar}
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold px-5 py-2 rounded-lg transition"
                >
                  {submitting ? "Agregando..." : "Agregar"}
                </button>
                <button
                  onClick={() => { setMostrarFormulario(false); setForm(EMPTY_FORM); }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Tab bar */}
          <div className="flex gap-1 mb-4 overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 p-1">
            {TIPOS_MULTIMEDIA.map((tipo) => (
              <button
                key={tipo.key}
                onClick={() => setTabActivo(tipo.key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  tabActivo === tipo.key
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{tipo.icon}</span>
                <span>{tipo.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tabActivo === tipo.key ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
                  {multimedia[tipo.key]?.length || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Content grid */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent"></div>
            </div>
          ) : itemsActivos.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="text-5xl mb-3">{TIPOS_MULTIMEDIA.find((t) => t.key === tabActivo)?.icon}</div>
              <p className="text-gray-500">No hay contenido de {TIPOS_MULTIMEDIA.find((t) => t.key === tabActivo)?.label.toLowerCase()}</p>
              {puedeCrear && (
                <button
                  onClick={() => setMostrarFormulario(true)}
                  className="mt-3 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  + Agregar el primero
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {itemsActivos.map((item, index) => (
                <MediaCard
                  key={item._id || index}
                  tipo={tabActivo}
                  item={item}
                  index={index}
                  total={itemsActivos.length}
                  onDelete={handleEliminar}
                  onMoveUp={(i) => handleMove(i, -1)}
                  onMoveDown={(i) => handleMove(i, 1)}
                  onEdit={(it) => setEditItem(it)}
                  canDelete={puedeEliminar}
                  canEdit={puedeCrear}
                />
              ))}
            </div>
          )}
        </>
      )}

      {!actividadSeleccionada && puedeListar && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-5xl mb-4">📁</div>
          <p className="text-gray-500">Seleccione una actividad para gestionar su multimedia</p>
        </div>
      )}

      {actividadSeleccionada && !puedeVer && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-red-600 text-xl">🚫</span>
          <span className="text-red-700">No tienes permisos para ver el contenido multimedia.</span>
        </div>
      )}

      {/* Edit modal */}
      {editItem && (
        <EditModal
          item={editItem}
          tipo={tabActivo}
          onClose={() => setEditItem(null)}
          onSave={handleSaveEdit}
        />
      )}
    </section>
  );
}
