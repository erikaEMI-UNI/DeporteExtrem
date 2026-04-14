const mongoose = require('mongoose');

const historialSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    accion: { type: String, required: true },
    detalles: { type: mongoose.Schema.Types.Mixed }, // Puede ser cualquier tipo de información útil
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Historial', historialSchema);
