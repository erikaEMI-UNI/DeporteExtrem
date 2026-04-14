const mongoose = require('mongoose');

const itinerarioSchema = new mongoose.Schema({
    recurso: { type: String, enum: ['Vehiculo', 'Guia', 'Equipo'], required: true },
    referencia: { type: String, required: true },
    actividad: { type: mongoose.Schema.Types.ObjectId, ref: 'Actividad' },
    estado: { type: String, enum: ['Libre', 'Ocupado', 'Mantenimiento'], default: 'Libre' },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
    observaciones: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Itinerario', itinerarioSchema);
