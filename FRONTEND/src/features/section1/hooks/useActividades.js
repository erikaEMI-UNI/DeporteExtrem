import { useState, useEffect } from 'react';
import { actividadesService } from '../services/actividadesService';

export const useActividades = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        setLoading(true);
        const formatted = await actividadesService.fetchActividades();
        setRegions(formatted);
      } catch (err) {
        console.error("Error cargando actividades:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActividades();
  }, []);

  return { regions, loading, error, setRegions };
};