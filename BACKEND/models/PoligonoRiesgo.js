const mongoose = require('mongoose');

const poligonoRiesgoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    geometria: {
        type: { type: String, enum: ['Polygon'], required: true },
        coordinates: { type: [[[Number]]], required: true }
    },
    riesgo: { 
        type: String, 
        enum: ['Bajo', 'Medio', 'Alto'], 
        required: true 
    },
    temporada: {
        type: String,
        required: true
    },
    actividadAsociada: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Actividad',
        required: true
    },
    areaHectareas: {
        type: Number
    },
    // Opcional para guardar el autor del poligono
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Índices
poligonoRiesgoSchema.index({ geometria: '2dsphere' });
poligonoRiesgoSchema.index({ actividadAsociada: 1 });
poligonoRiesgoSchema.index({ temporada: 1 });

module.exports = mongoose.model('PoligonoRiesgo', poligonoRiesgoSchema);
