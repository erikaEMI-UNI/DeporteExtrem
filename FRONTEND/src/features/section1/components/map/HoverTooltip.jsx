import { MapPin, Zap, Video } from '../shared/icons';

const HoverTooltip = ({ region, position }) => (
  <div
    className="fixed z-50 pointer-events-none animate-fadeIn"
    style={{
      left: position.x + 20,
      top: position.y - 140,
    }}
  >
    <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-100 overflow-hidden max-w-sm">
      <div className="relative h-40">
        <img
          src={region.images?.[0]?.url || region.images?.[0] || "https://images.pexels.com/photos/26871874/pexels-photo-26871874.jpeg"}
          alt={region.name}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${region.gradient} opacity-20`}></div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-xs font-bold text-gray-700">{region.nivel}</span>
        </div>
        {region.video360 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Video size={12} />
            360°
          </div>
        )}
      </div>

      <div className="p-4">
        <h4 className="font-bold text-xl text-gray-900 mb-1">{region.name}</h4>
        <p className="text-sm text-red-600 font-semibold mb-2 flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {region.department}
        </p>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{region.description}</p>
        <div className={`flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-gradient-to-r ${region.gradient} bg-opacity-10`}>
          <span className="font-semibold text-gray-700">{region.sport}</span>
          <Zap className="w-4 h-4 text-orange-600" />
        </div>
        {region.precio > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {region.enDescuento && region.descuento > 0 ? (
              <>
                <span className="bg-rose-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                  -{region.descuento}% OFF
                </span>
                <span className="text-sm text-gray-400 line-through">
                  Bs. {region.precio.toLocaleString()}
                </span>
                <span className="text-base font-black text-rose-600">
                  Bs. {(region.precio * (1 - region.descuento / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-emerald-600">
                Bs. {region.precio.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default HoverTooltip;