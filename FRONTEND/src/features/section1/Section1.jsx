"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MapSection from "./components/map/MapSection";
import HoverTooltip from "./components/map/HoverTooltip";
import ActivityModal from "./components/shared/ActivityModal";
import ReservaModal from "./components/modals/ReservaModal";
import Video360Modal from "./components/modals/Video360Modal";
import DeporteModal from "./components/modals/DeporteModal";
import EquipoModal from "./components/modals/EquipoModal";
import FilterBar from "./components/filters/FilterBar";
import { useActividades } from "./hooks/useActividades";
import { X } from "./components/shared/icons";

const RIESGOS_DEFAULT  = new Set(["Alto", "Medio", "Bajo"]);

const Section1 = () => {
  const { regions, loading, error } = useActividades();
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [modalState, setModalState] = useState({
    video360: false,
    deporte: false,
    equipo: false,
    reserva: false
  });

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    categoriaId: null,            // null = todas las categorías
    riesgos:     RIESGOS_DEFAULT, // Set con niveles visibles
    dificultad:  null,            // null = todas las dificultades
  });

  // Regiones que pasan los filtros activos
  const filteredRegions = useMemo(() => {
    return regions.filter((r) => {
      if (filters.categoriaId &&
          !(r.categorias || []).some(c => c._id === filters.categoriaId)) return false;
      if (!filters.riesgos.has(r.nivel ?? "Bajo"))    return false;
      if (filters.dificultad && r.fichaTecnica?.dificultad !== filters.dificultad) return false;
      return true;
    });
  }, [regions, filters]);

  const navigate = useNavigate();

  const handleHoverRegion = (region, event) => {
    setHoveredRegion(region);
    if (event) {
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleImageClick = (type) => {
    setModalState(prev => ({ ...prev, [type]: true }));
  };

  const closeModal = (type) => {
    setModalState(prev => ({ ...prev, [type]: false }));
  };

  const closeAllModals = () => {
    setModalState({
      video360: false,
      deporte: false,
      equipo: false,
      reserva: false
    });
  };

  const handleReservar = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    
    closeAllModals();
    setModalState(prev => ({ ...prev, reserva: true }));
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  if (regions.length === 0) return <EmptyState />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-4 sm:p-6">
      <HeaderStats regions={regions} />

      {/* ── Barra de filtros ── */}
      <FilterBar
        regions={regions}
        filters={filters}
        onChange={setFilters}
        resultCount={filteredRegions.length}
      />

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden">
          <MapSection
            regions={filteredRegions}
            riesgoFilter={filters.riesgos}
            onSelectRegion={setSelectedRegion}
            onHoverRegion={handleHoverRegion}
          />
        </div>
      </div>

      {hoveredRegion && (
        <HoverTooltip 
          region={hoveredRegion} 
          position={mousePosition} 
        />
      )}

      {selectedRegion && (
        <ActivityModal
          region={selectedRegion}
          onClose={() => setSelectedRegion(null)}
          onImageClick={handleImageClick}
          onReservar={handleReservar}
        />
      )}

      <Video360Modal 
        isOpen={modalState.video360} 
        onClose={() => closeModal('video360')}
        videoUrl={selectedRegion?.video360}
        activityName={selectedRegion?.name}
        onReservar={handleReservar}
      />
      
      <DeporteModal 
        isOpen={modalState.deporte} 
        onClose={() => closeModal('deporte')}
        deporte={selectedRegion?.sport}
        actividad={selectedRegion}
        onReservar={handleReservar}
      />
      
      <EquipoModal
        isOpen={modalState.equipo}
        onClose={() => closeModal('equipo')}
        onReservar={handleReservar}
        modelos3d={selectedRegion?.modelos3d || []}
        categorias={selectedRegion?.categorias || []}
      />
      
      <ReservaModal
        isOpen={modalState.reserva}
        onClose={() => closeModal('reserva')}
        actividad={selectedRegion}
      />

      <GlobalStyles />
    </div>
  );
};

// Componentes de estado
const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-4 sm:p-6 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Cargando actividades...</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-4 sm:p-6 flex items-center justify-center">
    <div className="text-center max-w-md">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <X className="w-8 h-8 text-red-600" />
      </div>
      <p className="text-red-600 font-semibold mb-2">Error al cargar actividades</p>
      <p className="text-gray-600 text-sm">{error}</p>
      <button
        onClick={onRetry}
        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
      >
        Reintentar
      </button>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-4 sm:p-6 flex items-center justify-center">
    <div className="text-center">
      <p className="text-gray-600 font-medium">No hay actividades disponibles</p>
    </div>
  </div>
);

const HeaderStats = ({ regions }) => (
  <div className="max-w-7xl mx-auto mb-8">
    <div className="text-center mb-6">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 mb-3 drop-shadow-sm">
        Bolivia · Deportes Extremos
      </h1>
      <p className="text-gray-600 text-lg font-medium">
        Descubre actividades de aventura en tiempo real
      </p>
      
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <StatCardSimple
          value={regions.length}
          label="Actividades"
          color="text-red-600"
          borderColor="border-red-100"
        />
        <StatCardSimple
          value={new Set(regions.map(r => r.department)).size}
          label="Departamentos"
          color="text-orange-600"
          borderColor="border-orange-100"
        />
        <StatCardSimple
          value="365"
          label="Días/año"
          color="text-amber-600"
          borderColor="border-amber-100"
        />
      </div>
    </div>
  </div>
);

const StatCardSimple = ({ value, label, color, borderColor }) => (
  <div className={`bg-white rounded-xl px-6 py-3 shadow-md border ${borderColor}`}>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-sm text-gray-600">{label}</p>
  </div>
);

const GlobalStyles = () => (
  <style jsx>{`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
    .animate-slideUp {
      animation: slideUp 0.3s ease-out;
    }
  `}</style>
);

export default Section1;