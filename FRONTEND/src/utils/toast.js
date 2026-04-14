// Sistema de Toast global basado en eventos del DOM
// Uso: import toast from "@/utils/toast"
//      toast.success("Guardado correctamente")
//      toast.error("Algo salió mal")
//      toast.warning("Ten cuidado")
//      toast.info("Ten en cuenta que...")

const TOAST_EVENT = "app:toast";

const emit = (type, message, duration = 3500) => {
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, { detail: { type, message, duration } })
  );
};

const toast = {
  success: (msg, duration)  => emit("success", msg, duration),
  error:   (msg, duration)  => emit("error",   msg, duration),
  warning: (msg, duration)  => emit("warning", msg, duration),
  info:    (msg, duration)  => emit("info",    msg, duration),
  /** Alias genérico por si algún alert no tiene tipo claro */
  show:    (msg, duration)  => emit("info",    msg, duration),
  TOAST_EVENT,
};

export default toast;
