import { X, DollarSign, Video } from './icons';

// Modal Container
export const ModalContainer = ({ children, onClose, maxWidth = "max-w-5xl" }) => (
  <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4" onClick={onClose}>
    <div className={`bg-white rounded-3xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-hidden`} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

// Modal Header
export const ModalHeader = ({ title, subtitle, icon, gradient, onClose }) => (
  <div className={`bg-gradient-to-r ${gradient} px-6 py-4 flex items-center justify-between`}>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        {subtitle && <p className="text-white/80 text-sm">{subtitle}</p>}
      </div>
    </div>
    <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
      <X size={24} />
    </button>
  </div>
);

// Modal Footer
export const ModalFooter = ({ onClose, onConfirm, loading, confirmText = "Confirmar", cancelText = "Cancelar" }) => (
  <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
    <button
      onClick={onClose}
      disabled={loading}
      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {cancelText}
    </button>
    <button
      onClick={onConfirm}
      disabled={loading}
      className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      {confirmText}
    </button>
  </div>
);

// Field Components
export const ReadOnlyField = ({ label, value }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
    <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">
      {value}
    </div>
  </div>
);

export const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
      required
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export const DateField = ({ label, name, value, onChange }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
    <input
      type="date"
      name={name}
      value={value}
      onChange={onChange}
      min={new Date().toISOString().split('T')[0]}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
      required
    />
  </div>
);

export const NumberField = ({ label, name, value, onChange, min, max, helperText }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
    <input
      type="number"
      name={name}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
      required
    />
    {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
  </div>
);

export const ErrorMessage = ({ message }) => (
  <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
    {message}
  </div>
);

export const TipMessage = ({ message }) => (
  <div className="mt-6 bg-blue-50 p-4 rounded-xl">
    <p className="text-sm text-gray-700">💡 <strong>Tip:</strong> {message}</p>
  </div>
);

export const VideoPlaceholder = () => (
  <div className="bg-gray-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
    <div className="text-center text-white">
      <Video size={64} className="mx-auto mb-4 opacity-50" />
      <p className="text-xl font-semibold mb-2">No hay video 360° disponible</p>
      <p className="text-gray-400">Este contenido estará disponible próximamente</p>
    </div>
  </div>
);

export const ReservaCTA = ({ onReservar }) => (
  <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="text-sm text-gray-600 mb-1">¿Todo listo para la aventura?</p>
        <p className="text-2xl font-black text-gray-900">Reserva tu experiencia ahora</p>
      </div>
      <button 
        onClick={onReservar}
        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl transition-all transform hover:scale-105 whitespace-nowrap"
      >
        Reservar
      </button>
    </div>
  </div>
);

export const CategoriaSelector = ({ categoria }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">
      Categoría (según nivel de riesgo)
    </label>
    <div className="flex gap-3 flex-wrap pointer-events-none opacity-75">
      {['Principiante', 'Intermedio', 'Avanzado'].map(level => (
        <button
          key={level}
          type="button"
          disabled
          className={`px-4 py-2 rounded-lg font-semibold ${
            categoria === level
              ? level === 'Principiante' ? 'bg-cyan-500 text-white'
                : level === 'Intermedio' ? 'bg-lime-500 text-white'
                : 'bg-fuchsia-500 text-white'
              : level === 'Principiante' ? 'bg-cyan-100 text-cyan-700'
                : level === 'Intermedio' ? 'bg-lime-100 text-lime-700'
                : 'bg-fuchsia-100 text-fuchsia-700'
          }`}
        >
          {level}
        </button>
      ))}
    </div>
    <p className="text-xs text-gray-500 mt-2">
      ℹ️ La categoría se asigna automáticamente según el nivel de riesgo de la actividad
    </p>
  </div>
);

export const CostoTotalDisplay = ({ costoTotal, precioBase, numeroPersonas, tipoTour }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">Costo Total</label>
    <div className="w-full px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
      <div className="flex items-center gap-2">
        <DollarSign className="text-green-600" size={20} />
        <span className="text-2xl font-black text-green-700">
          Bs. {costoTotal.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      {tipoTour && (
        <p className="text-xs text-gray-600 mt-1">
          Precio base: Bs. {precioBase.toLocaleString()} × {numeroPersonas} persona(s)
          {tipoTour === 'Promocional' && ' (-20%)'}
          {tipoTour === 'VIP' && ' (+50%)'}
          {tipoTour === 'Intermedio' && ' (-10%)'}
        </p>
      )}
    </div>
  </div>
);