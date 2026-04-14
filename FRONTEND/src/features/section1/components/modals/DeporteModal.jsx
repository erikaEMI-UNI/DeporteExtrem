import { Mountain } from '../shared/icons';
import { ModalContainer, ModalHeader, ReservaCTA } from '../shared/ModalComponents';
import { getNivelColor } from '../../utils/formatters';

const DeporteModal = ({ isOpen, onClose, deporte, actividad, onReservar }) => {
  if (!isOpen) return null;

  return (
    <ModalContainer onClose={onClose} maxWidth="max-w-3xl">
      <ModalHeader 
        title={deporte || "Deporte Extremo"}
        icon={<Mountain size={24} />}
        gradient="from-cyan-600 to-blue-600"
        onClose={onClose}
      />
      
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
        <img
          src={actividad?.images?.[1] || "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200"}
          alt="Deporte extremo"
          className="w-full h-64 object-cover rounded-2xl mb-6"
        />

        <div className="space-y-6">
          <ActivityDescription 
            name={actividad?.name || deporte}
            description={actividad?.description}
          />
          
          {actividad?.recomendaciones && (
            <RecomendacionesBox recomendaciones={actividad.recomendaciones} />
          )}
          
          <ActivityStats 
            nivel={actividad?.nivel}
            duracion={actividad?.duracion}
          />
          
          <ReservaCTA onReservar={onReservar} />
        </div>
      </div>
    </ModalContainer>
  );
};

const ActivityDescription = ({ name, description }) => (
  <div>
    <h4 className="text-2xl font-bold text-gray-900 mb-3">{name}</h4>
    <p className="text-gray-700 text-lg leading-relaxed">
      {description || "Este deporte extremo combina adrenalina, técnica y conexión con la naturaleza. Perfecto para aventureros que buscan desafiar sus límites en los paisajes más impresionantes de Bolivia."}
    </p>
  </div>
);

const RecomendacionesBox = ({ recomendaciones }) => (
  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
    <h5 className="font-bold text-lg text-gray-900 mb-3">💡 Recomendaciones</h5>
    <p className="text-gray-700 whitespace-pre-line">{recomendaciones}</p>
  </div>
);

const ActivityStats = ({ nivel, duracion }) => (
  <div className="grid grid-cols-2 gap-4">
    <StatCard
      bgColor="from-green-50 to-emerald-50"
      borderColor="border-green-200"
      label="Nivel de Riesgo"
      value={nivel || "Medio"}
    />
    <StatCard
      bgColor="from-blue-50 to-cyan-50"
      borderColor="border-blue-200"
      label="Duración"
      value={duracion || "Medio día"}
    />
  </div>
);

const StatCard = ({ bgColor, borderColor, label, value }) => (
  <div className={`bg-gradient-to-br ${bgColor} p-4 rounded-xl border ${borderColor}`}>
    <p className="text-xs text-gray-600 font-semibold mb-1">{label}</p>
    <p className="text-lg font-bold text-gray-900">{value}</p>
  </div>
);

export default DeporteModal;