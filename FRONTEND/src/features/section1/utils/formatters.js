import { NIVEL_CONFIG } from './constants';

// Backward-compatible helpers: handle both old strings and new subdocument objects
const getUrl = (item) => typeof item === 'string' ? item : item?.url;

const getMediaItems = (arr) =>
  (arr || []).map((item) =>
    typeof item === 'string'
      ? { url: item, title: '', description: '', order: 0, is_360: false, _id: item }
      : item
  );

export const formatActividad = (item) => {
  const ft = item.fichaTecnica || {};
  return {
  id: item._id,
  name: item.nombre,
  department: item.ubicacion?.departamento || item.ubicacion?.zona || "Bolivia",
  sport: ft.categoria || item.categoria || item.nombre,
  categorias: (item.categorias || []).map(c =>
    typeof c === "object" ? c : { _id: c, nombre: c, icono: "🏔️", modelos3d: [] }
  ),
  // nivelRiesgo ahora viene calculado desde fechas activas (backend)
  nivel: item.nivelRiesgo || "Medio",
  duracion: ft.duracion || item.duracion || "Medio día",
  // capacidadMaxima calculada desde fechas activas (backend)
  capacidadMaxima: item.capacidadMaxima || 10,
  // precioDesde = mínimo calculado desde fechas activas (backend)
  precio: item.precioDesde || 0,
  descuento:   item.descuento   || 0,
  enDescuento: item.enDescuento || false,
  tieneVip:    item.tieneVip    || false,
  precioVip:   item.precioVip   || 0,
  modelos3d:   item.modelos3d   || [],
  actividades: [item.nombre],
  altitud: ft.altitud || item.ubicacion?.altitud || "N/D",
  temporada: ft.temporada || item.temporada || "Todo el año",
  recomendaciones: item.recomendaciones || "",
  // Ficha técnica completa
  fichaTecnica: {
    duracion:          ft.duracion          || "",
    dificultad:        ft.dificultad        || "",
    altitud:           ft.altitud           || "",
    clima:             ft.clima             || "",
    equipoNecesario:   ft.equipoNecesario   || [],
    edadMinima:        ft.edadMinima        ?? null,
    requisitosFisicos: ft.requisitosFisicos || "",
    categoria:         ft.categoria         || "",
    temporada:         ft.temporada         || "",
    incluye:           ft.incluye           || [],
    noIncluye:         ft.noIncluye         || [],
    puntoEncuentro:    ft.puntoEncuentro    || "",
    tiposActividad:    ft.tiposActividad    || [],
  },
  coordinates: [
    item.ubicacion?.coordinates?.[1] || -16.5,
    item.ubicacion?.coordinates?.[0] || -68.15,
  ],
  images: getMediaItems(item.multimedia?.imagenes).length > 0
    ? getMediaItems(item.multimedia?.imagenes)
    : [{ url: "https://images.pexels.com/photos/26871874/pexels-photo-26871874.jpeg", title: '', description: '', order: 0, is_360: false, _id: 'default' }],
  video360: getUrl(item.multimedia?.videos360?.[0]) || null,
  description: item.descripcion || "Actividad de deportes extremos en Bolivia",
  color: NIVEL_CONFIG[item.nivelRiesgo]?.color || NIVEL_CONFIG.Medio.color,
  gradient: NIVEL_CONFIG[item.nivelRiesgo]?.gradient || NIVEL_CONFIG.Medio.gradient,
  multimedia: {
    imagenes:        getMediaItems(item.multimedia?.imagenes),
    videos:          getMediaItems(item.multimedia?.videos),
    panoramicas:     getMediaItems(item.multimedia?.panoramicas),
    videos360:       getMediaItems(item.multimedia?.videos360),
    audio:           getMediaItems(item.multimedia?.audio),
    enlacesInternos: getMediaItems(item.multimedia?.enlacesInternos),
  },
  };
};

export const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`
    : url;
};

export const getNivelColor = (nivel) => NIVEL_CONFIG[nivel]?.color || NIVEL_CONFIG.Medio.color;
export const getNivelGradient = (nivel) => NIVEL_CONFIG[nivel]?.gradient || NIVEL_CONFIG.Medio.gradient;
