// C:\Users\Hp\Desktop\erika\cod\V7_Proyect\proyec1F\FRONTEND\src\features\section1\components\map\RegionMarker.jsx
// Versión simplificada - solo utilidades para crear marcadores

// Función para crear el elemento HTML del marcador
export const createMarkerElement = (region, onSelect, onHover) => {
  const colors = {
    Alto: '#ef4444',
    Medio: '#f59e0b',
    Bajo: '#10b981'
  };

  const color = colors[region.nivel] || colors.Medio;

  const el = document.createElement('div');
  el.style.width = '24px';
  el.style.height = '24px';
  el.style.background = color;
  el.style.borderRadius = '50%';
  el.style.border = '3px solid white';
  el.style.cursor = 'pointer';
  el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  el.style.transition = 'all 0.2s ease';
  el.title = region.name;

  // Event listeners
  el.addEventListener('mouseenter', (e) => {
    el.style.transform = 'scale(1.2)';
    el.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.8), 0 0 0 2px white';
    if (onHover) onHover(region, e);
  });

  el.addEventListener('mousemove', (e) => {
    if (onHover) onHover(region, e);
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'scale(1)';
    el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    if (onHover) onHover(null);
  });

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(region);
  });

  return el;
};

// Función para crear un popup HTML
export const createPopupHTML = (region) => {
  const nivelColors = {
    Alto: { bg: '#fee2e2', text: '#b91c1c' },
    Medio: { bg: '#fef3c7', text: '#92400e' },
    Bajo: { bg: '#d1fae5', text: '#065f46' }
  };

  const color = nivelColors[region.nivel] || nivelColors.Medio;

  return `
    <div style="padding: 12px; min-width: 200px;">
      <h3 style="font-weight: bold; font-size: 16px; margin: 0 0 4px 0; color: #111;">
        ${region.name}
      </h3>
      <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
        ${region.department}
      </p>
      <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
        <span style="
          display: inline-block;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          background-color: ${color.bg};
          color: ${color.text};
        ">
          ${region.nivel}
        </span>
        <span style="font-size: 14px; color: #374151;">
          ⚡ ${region.sport}
        </span>
      </div>
      ${region.video360 ? `
        <div style="
          margin-top: 8px;
          padding: 4px 8px;
          background-color: #fee2e2;
          border-radius: 6px;
          font-size: 12px;
          color: #b91c1c;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          🎥 Video 360° disponible
        </div>
      ` : ''}
      ${region.enDescuento && region.descuento > 0 ? `
        <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="
            background: #ef4444; color: white;
            font-size: 11px; font-weight: 800;
            padding: 2px 7px; border-radius: 9999px;
          ">-${region.descuento}% OFF</span>
          <span style="font-size: 12px; color: #9ca3af; text-decoration: line-through;">
            Bs. ${region.precio?.toLocaleString() || '—'}
          </span>
          <span style="font-size: 15px; color: #ef4444; font-weight: 800;">
            Bs. ${region.precio ? (region.precio * (1 - region.descuento / 100)).toLocaleString(undefined, {maximumFractionDigits:2}) : '—'}
          </span>
        </div>
      ` : `
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #059669; font-weight: 600;">
          Bs. ${region.precio?.toLocaleString() || 'Consultar'}
        </p>
      `}
    </div>
  `;
};

// Hook personalizado para manejar marcadores (opcional)
export const createMarkers = (map, regions, onSelectRegion, onHoverRegion) => {
  if (!map || !regions.length) return [];

  const markers = [];

  regions.forEach((region) => {
    if (!region.coordinates || !Array.isArray(region.coordinates)) return;

    const [lat, lng] = region.coordinates;
    
    if (typeof lat !== 'number' || typeof lng !== 'number' || 
        isNaN(lat) || isNaN(lng)) return;

    try {
      const element = createMarkerElement(region, onSelectRegion, onHoverRegion);
      
      const marker = new maplibregl.Marker({ element })
        .setLngLat([lng, lat])
        .addTo(map);

      // Crear popup
      const popup = new maplibregl.Popup({ 
        offset: 25,
        closeButton: false,
        closeOnClick: false
      })
        .setLngLat([lng, lat])
        .setHTML(createPopupHTML(region));

      marker.setPopup(popup);

      markers.push(marker);
    } catch (error) {
      console.error('Error creating marker:', error);
    }
  });

  return markers;
};