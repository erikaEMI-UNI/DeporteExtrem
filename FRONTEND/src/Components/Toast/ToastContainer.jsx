import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import toast from "../../utils/toast";

const STYLES = {
  success: {
    bar:   "bg-gradient-to-r from-green-500 to-emerald-500",
    icon:  <CheckCircle className="w-5 h-5 text-white" />,
    bg:    "bg-white border-l-4 border-green-500",
    title: "text-green-700",
  },
  error: {
    bar:   "bg-gradient-to-r from-red-600 to-rose-600",
    icon:  <XCircle className="w-5 h-5 text-white" />,
    bg:    "bg-white border-l-4 border-red-600",
    title: "text-red-700",
  },
  warning: {
    bar:   "bg-gradient-to-r from-amber-500 to-orange-500",
    icon:  <AlertTriangle className="w-5 h-5 text-white" />,
    bg:    "bg-white border-l-4 border-amber-500",
    title: "text-amber-700",
  },
  info: {
    bar:   "bg-gradient-to-r from-blue-500 to-indigo-500",
    icon:  <Info className="w-5 h-5 text-white" />,
    bg:    "bg-white border-l-4 border-blue-500",
    title: "text-blue-700",
  },
};

const LABELS = {
  success: "Éxito",
  error:   "Error",
  warning: "Advertencia",
  info:    "Información",
};

let _id = 0;

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  // Escucha eventos globales emitidos por toast.js
  useEffect(() => {
    const handler = (e) => {
      const { type, message, duration } = e.detail;
      const id = ++_id;
      setToasts((prev) => [...prev, { id, type, message, duration, exiting: false }]);

      // Auto-cerrar
      setTimeout(() => dismiss(id), duration);
    };

    window.addEventListener(toast.TOAST_EVENT, handler);
    return () => window.removeEventListener(toast.TOAST_EVENT, handler);
  }, []);

  const dismiss = (id) => {
    // Marca como "saliendo" para animar
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    // Elimina tras la animación
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 350);
  };

  if (!toasts.length) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-80 pointer-events-none">
      {toasts.map((t) => {
        const s = STYLES[t.type] || STYLES.info;
        return (
          <div
            key={t.id}
            className={`
              pointer-events-auto rounded-xl shadow-xl overflow-hidden
              ${s.bg}
              transition-all duration-350
              ${t.exiting
                ? "opacity-0 translate-x-8"
                : "opacity-100 translate-x-0"}
            `}
            style={{
              animation: t.exiting ? "none" : "toastIn 0.35s ease",
            }}
          >
            {/* Barra superior de color */}
            <div className={`${s.bar} flex items-center gap-2 px-4 py-2`}>
              {s.icon}
              <span className="text-white font-bold text-sm tracking-wide">
                {LABELS[t.type]}
              </span>
              <button
                className="ml-auto text-white/80 hover:text-white transition-colors"
                onClick={() => dismiss(t.id)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mensaje */}
            <div className="px-4 py-3">
              <p className={`text-sm font-medium ${s.title}`}>{t.message}</p>
            </div>

            {/* Barra de progreso */}
            <div className="h-1 bg-gray-100">
              <div
                className={`h-full ${s.bar}`}
                style={{
                  animation: `toastProgress ${t.duration}ms linear forwards`,
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Animaciones CSS */}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(2rem); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}
