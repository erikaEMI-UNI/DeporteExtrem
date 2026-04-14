const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  destinatario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipo: {
    type: String,
    enum: ['incidente', 'confirmacion_salida', 'nueva_reserva', 'cambio_reserva', 'cancelacion_reserva', 'general'],
    required: true,
  },
  titulo:   { type: String, required: true },
  mensaje:  { type: String, required: true },
  leida:    { type: Boolean, default: false },
  prioridad:{ type: String, enum: ['normal', 'alta'], default: 'normal' },
  datos:    { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

notificationSchema.index({ destinatario: 1, leida: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
