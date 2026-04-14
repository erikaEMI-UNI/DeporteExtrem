import axios from 'axios';

const API_BASE_URL = "/api";

const poligonoService = {
  obtenerPoligonos: async (actividadId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/actividades/${actividadId}/poligonos`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo polígonos:', error);
      throw error;
    }
  },

  crearPoligono: async (actividadId, data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/actividades/${actividadId}/poligonos`, data);
      return response.data;
    } catch (error) {
      console.error('Error creando polígono:', error);
      throw error;
    }
  },

  actualizarPoligono: async (actividadId, poligonoId, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/actividades/${actividadId}/poligonos/${poligonoId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error actualizando polígono:', error);
      throw error;
    }
  },

  eliminarPoligono: async (actividadId, poligonoId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/actividades/${actividadId}/poligonos/${poligonoId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando polígono:', error);
      throw error;
    }
  }
};

export default poligonoService;