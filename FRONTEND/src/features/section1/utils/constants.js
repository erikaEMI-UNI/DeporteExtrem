// Constantes y configuración
export const API_BASE_URL = "/api";
export const MAX_MOSAIC_IMAGES = 3;

export const NIVEL_CONFIG = {
  Alto: {
    color: "bg-red-100 text-red-700 border-red-200",
    gradient: "from-red-500 to-orange-500",
    categoria: "Avanzado"
  },
  Medio: {
    color: "bg-amber-100 text-amber-700 border-amber-200",
    gradient: "from-amber-500 to-yellow-500",
    categoria: "Intermedio"
  },
  Bajo: {
    color: "bg-green-100 text-green-700 border-green-200",
    gradient: "from-green-500 to-emerald-500",
    categoria: "Principiante"
  }
};

export const TOUR_MULTIPLICADORES = {
  Promocional: 0.8,
  VIP: 1.5,
  Intermedio: 0.9
};