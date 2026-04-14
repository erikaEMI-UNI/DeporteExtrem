import { X, MapPin, Trophy, Video, Mountain, Clock, Users, Zap } from './icons';
import ImageMosaic from './ImageMosaic';
import GaleriaMultimedia from './GaleriaMultimedia';
import TimelineItinerario from './TimelineItinerario';
import FichaTecnica from './FichaTecnica';
import { MAX_MOSAIC_IMAGES } from '../../utils/constants';
import { getNivelColor } from '../../utils/formatters';

// Check if any multimedia type has at least one item
const hasMultimedia = (region) => {
  if (!region.multimedia) return false;
  return Object.values(region.multimedia).some(
    (arr) => Array.isArray(arr) && arr.length > 0
  );
};

const ActivityModal = ({ region, onClose, onImageClick, onReservar }) => (
  <div
    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`bg-gradient-to-r ${region.gradient} p-8 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-4xl font-black text-white mb-2 drop-shadow-lg">
                {region.name}
              </h3>
              <p className="text-white/90 text-lg font-medium flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {region.department}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-3 transition-all backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${getNivelColor(region.nivel)} border-2 font-bold text-sm`}>
              <Trophy className="w-4 h-4 mr-2" />
              Nivel: {region.nivel}
            </div>
            {region.video360 && (
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-600 text-white font-bold text-sm">
                <Video className="w-4 h-4 mr-2" />
                Video 360° disponible
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <ImageMosaic
              images={region.images.map((m) => (typeof m === 'string' ? m : m.url))}
              maxImages={MAX_MOSAIC_IMAGES}
              onImageClick={onImageClick}
              hasVideo360={!!region.video360}
            />

            <div className="grid grid-cols-2 gap-3">
              <DetailCard
                label="Altitud"
                value={region.altitud}
                bgColor="from-red-50 to-orange-50"
                borderColor="border-red-100"
              />
              <DetailCard
                label="Temporada"
                value={region.temporada}
                bgColor="from-orange-50 to-amber-50"
                borderColor="border-orange-100"
              />
            </div>
          </div>

          <div className="space-y-6">
            <ActivityDescription
              name={region.name}
              description={region.description}
            />

            <div className="space-y-3">
              <FeatureCard
                icon={<Mountain className="w-6 h-6 text-green-600" />}
                label="Categoría"
                value={region.sport}
                bgColor="from-green-50 to-emerald-50"
                borderColor="border-green-100"
              />

              <FeatureCard
                icon={<Clock className="w-6 h-6 text-blue-600" />}
                label="Duración"
                value={region.duracion}
                bgColor="from-blue-50 to-cyan-50"
                borderColor="border-blue-100"
              />

              <FeatureCard
                icon={<Users className="w-6 h-6 text-purple-600" />}
                label="Capacidad máxima"
                value={`${region.capacidadMaxima} personas`}
                bgColor="from-purple-50 to-pink-50"
                borderColor="border-purple-100"
              />

              <div className={`flex items-center gap-4 p-4 rounded-xl border-2 ${getNivelColor(region.nivel)}`}>
                <Zap className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium opacity-75">Nivel de dificultad</p>
                  <p className="text-base font-bold">{region.nivel}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ficha Técnica */}
        <FichaTecnica
          fichaTecnica={region.fichaTecnica}
          recomendaciones={region.recomendaciones}
        />

        {/* Multimedia Gallery */}
        {hasMultimedia(region) && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h4 className="text-xl font-bold text-gray-900 mb-4">🎬 Galería Multimedia</h4>
            <GaleriaMultimedia multimedia={region.multimedia} />
          </div>
        )}

        {/* Itinerary Timeline */}
        {region.id && <TimelineItinerario actividadId={region.id} />}

        {(region.precio > 0 || (region.tieneVip && region.precioVip > 0)) && (
          <PrecioCard
            precio={region.precio}
            descuento={region.descuento || 0}
            enDescuento={region.enDescuento || false}
            gradient={region.gradient}
            onReservar={onReservar}
            tieneVip={region.tieneVip || false}
            precioVip={region.precioVip || 0}
          />
        )}
      </div>
    </div>
  </div>
);

const DetailCard = ({ label, value, bgColor, borderColor }) => (
  <div className={`bg-gradient-to-br ${bgColor} rounded-xl p-4 border ${borderColor}`}>
    <p className="text-xs text-gray-600 mb-1">{label}</p>
    <p className="text-lg font-bold text-gray-900">{value}</p>
  </div>
);

const FeatureCard = ({ icon, label, value, bgColor, borderColor }) => (
  <div className={`flex items-center gap-4 bg-gradient-to-r ${bgColor} p-4 rounded-xl border ${borderColor}`}>
    {icon}
    <div>
      <p className="text-xs text-gray-600 font-medium">{label}</p>
      <p className="text-base font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const ActivityDescription = ({ name, description }) => (
  <div>
    <h4 className="text-2xl font-bold text-gray-900 mb-3">{name}</h4>
    <p className="text-gray-700 text-lg leading-relaxed">
      {description || "Este deporte extremo combina adrenalina, técnica y conexión con la naturaleza. Perfecto para aventureros que buscan desafiar sus límites en los paisajes más impresionantes de Bolivia."}
    </p>
  </div>
);

const PrecioCard = ({ precio, descuento, enDescuento, gradient, onReservar, tieneVip, precioVip }) => {
  // Actividad sin precio base pero con precio VIP fijo
  const soloVip = tieneVip && precioVip > 0 && precio === 0;
  const precioConDesc = !soloVip && enDescuento && descuento > 0
    ? +(precio * (1 - descuento / 100)).toFixed(2)
    : null;
  return (
  <div className={`flex items-center justify-between p-6 rounded-2xl border mt-8 ${
    soloVip
      ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300"
      : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
  }`}>
    <div>
      {soloVip ? (
        <>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">⭐</span>
            <p className="text-sm font-bold text-yellow-700">Precio especial VIP</p>
          </div>
          <p className="text-3xl font-black text-yellow-800">
            Bs. {precioVip.toLocaleString()}
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            * Precio fijo por persona — solo disponible en tour VIP
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-gray-600">Precio por persona</p>
            {enDescuento && descuento > 0 && (
              <span className="bg-rose-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                -{descuento}% OFF
              </span>
            )}
          </div>
          {precioConDesc !== null ? (
            <div className="flex items-baseline gap-2">
              <p className="text-xl text-gray-400 line-through font-semibold">
                Bs. {precio.toLocaleString()}
              </p>
              <p className="text-3xl font-black text-rose-600">
                Bs. {precioConDesc.toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-3xl font-black text-gray-900">
              Bs. {precio.toLocaleString()}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            * Precio adicional según tipo de tour seleccionado
          </p>
        </>
      )}
    </div>
    <button
      onClick={onReservar}
      className={`bg-gradient-to-r ${gradient} text-white font-bold py-4 px-8 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
    >
      Reservar ahora
    </button>
  </div>
  );
};

export default ActivityModal;
