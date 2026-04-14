// C:\Users\Hp\Desktop\erika\cod\V7_Proyect\proyec1F\FRONTEND\src\features\section1\utils\validator.js

/**
 * Validadores para el formulario de reserva
 */

export const validateReservaForm = (formData, actividad) => {
  const errors = {};

  // Validar tipo de tour
  if (!formData.tipoTour) {
    errors.tipoTour = 'Por favor selecciona un tipo de tour';
  }

  // Validar fecha
  if (!formData.fechas) {
    errors.fechas = 'Por favor selecciona una fecha';
  } else {
    const selectedDate = new Date(formData.fechas);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.fechas = 'La fecha no puede ser en el pasado';
    }
  }

  // Validar número de personas
  if (!formData.numeroPersonas || formData.numeroPersonas < 1) {
    errors.numeroPersonas = 'El número de personas debe ser mayor a 0';
  } else if (actividad && formData.numeroPersonas > actividad.capacidadMaxima) {
    errors.numeroPersonas = `El número máximo de personas es ${actividad.capacidadMaxima}`;
  }

  return errors;
};

/**
 * Valida que el usuario esté autenticado antes de reservar
 */
export const validateAuthBeforeReserva = () => {
  const token = localStorage.getItem('authToken');
  return {
    isValid: !!token,
    token,
    error: !token ? 'Debes iniciar sesión para realizar una reserva' : null
  };
};

/**
 * Valida que los datos de la actividad sean correctos
 */
export const validateActividadData = (actividad) => {
  if (!actividad) {
    return {
      isValid: false,
      error: 'No se ha seleccionado ninguna actividad'
    };
  }

  if (!actividad.id) {
    return {
      isValid: false,
      error: 'La actividad no tiene un ID válido'
    };
  }

  if (!actividad.precio || actividad.precio <= 0) {
    return {
      isValid: false,
      error: 'La actividad no tiene un precio válido'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Formatea y valida el costo total
 */
export const validateCostoTotal = (costoTotal) => {
  if (isNaN(costoTotal) || costoTotal < 0) {
    return {
      isValid: false,
      formattedValue: 0
    };
  }

  return {
    isValid: true,
    formattedValue: Number(costoTotal.toFixed(2))
  };
};

/**
 * Valida que las imágenes de la actividad existan
 */
export const validateActivityImages = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return {
      isValid: false,
      defaultImage: "https://images.pexels.com/photos/26871874/pexels-photo-26871874.jpeg"
    };
  }

  return {
    isValid: true,
    images: images.filter(img => img && typeof img === 'string')
  };
};

/**
 * Valida la URL del video 360°
 */
export const validateVideoUrl = (url) => {
  if (!url) return null;
  
  // Validar URL de YouTube
  const youtubeRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(youtubeRegex);
  
  if (match && match[2].length === 11) {
    return url; // Es una URL válida de YouTube
  }
  
  // Validar URL genérica
  try {
    new URL(url);
    return url; // Es una URL válida
  } catch {
    return null; // URL inválida
  }
};