const mongoose = require('mongoose');

const reporteSchema = new mongoose.Schema({
    tipo: { type: String, required: true }, // Ej: 'Reservas por Actividad'
    datos: { type: mongoose.Schema.Types.Mixed }, // Datos agregados
    generadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reporte', reporteSchema);
