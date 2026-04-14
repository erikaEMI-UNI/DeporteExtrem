// Servicio de fechas — usa fetch con el proxy de Vite (/api/...)
// igual que el resto de servicios del proyecto

const BASE = "/api";

const getToken = () => localStorage.getItem("authToken");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
};

export const fechaService = {
  // Obtener todas las fechas de una actividad
  getFechas: (actividadId, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const url = `${BASE}/actividades/${actividadId}/fechas${qs ? `?${qs}` : ""}`;
    return fetch(url, { headers: authHeaders() }).then(handleResponse);
  },

  // Crear nueva fecha
  createFecha: (actividadId, fechaData) =>
    fetch(`${BASE}/actividades/${actividadId}/fechas`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(fechaData),
    }).then(handleResponse),

  // Actualizar fecha
  updateFecha: (actividadId, fechaId, fechaData) =>
    fetch(`${BASE}/actividades/${actividadId}/fechas/${fechaId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(fechaData),
    }).then(handleResponse),

  // Eliminar fecha
  deleteFecha: (actividadId, fechaId) =>
    fetch(`${BASE}/actividades/${actividadId}/fechas/${fechaId}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleResponse),

  // Verificar disponibilidad
  verificarDisponibilidad: (actividadId, fechaId) =>
    fetch(`${BASE}/actividades/${actividadId}/fechas/${fechaId}/verificar`, {
      headers: authHeaders(),
    }).then(handleResponse),

  // Fechas disponibles públicas (sin auth)
  getFechasDisponibles: (actividadId) =>
    fetch(`${BASE}/actividades/${actividadId}/fechas/disponibles`).then(handleResponse),
};