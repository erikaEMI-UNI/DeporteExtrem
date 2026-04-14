import { API_BASE_URL } from '../utils/constants';
import { formatActividad } from '../utils/formatters';

export const actividadesService = {
  async fetchActividades() {
    const token = localStorage.getItem('authToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}/actividades/public`, { headers });

    if (!response.ok) {
      throw new Error("Error al cargar actividades");
    }

    const data = await response.json();
    return data.map(formatActividad);
  },

  async createReserva(reservaData, token) {
    const response = await fetch(`${API_BASE_URL}/reservas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reservaData)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.msg || 'Error al crear la reserva');
    return data;
  },

  /** Reserva con archivo adjunto (ficha médica) — riesgo Alto */
  async createReservaConArchivo(formData, token) {
    const response = await fetch(`${API_BASE_URL}/reservas`, {
      method: 'POST',
      headers: {
        // No poner Content-Type: el browser lo pone solo con el boundary correcto
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.msg || 'Error al crear la reserva');
    return data;
  }
};