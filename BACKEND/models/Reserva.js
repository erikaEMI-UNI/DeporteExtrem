const mongoose = require('mongoose');

const participanteSchema = new mongoose.Schema({
    nombre:             { type: String, required: true },
    alergias:           { type: Boolean, default: false },
    alergiasDetalle:    { type: String, default: '' },
    enfermedad:         { type: Boolean, default: false },
    enfermedadDetalle:  { type: String, default: '' },
    medicamento:        { type: Boolean, default: false },
    medicamentoDetalle: { type: String, default: '' },
    grupoSanguineo:     { type: String, default: '' },
    telefonoRespaldo:   { type: String, default: '' },
}, { _id: false });

const reservaSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    actividad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Actividad',
        required: true
    },

    // Slot de fecha elegido por el admin (rango)
    fechaId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    // Día exacto elegido por el cliente dentro del rango
    fechaActividad: {
        type: Date,
        required: true
    },

    tipoTour: {
        type: String,
        enum: ['Promocional', 'VIP', 'Intermedio'],
        required: true
    },

    nivelRiesgo: {
        type: String,
        enum: ['Bajo', 'Medio', 'Alto'],
    },

    precioBase: {
        type: Number,
        min: 0,
        default: 0
    },

    numeroPersonas: {
        type: Number,
        required: true,
        min: 1
    },

    categoria: {
        type: String,
        enum: ['Principiante', 'Intermedio', 'Avanzado'],
        required: true
    },

    costoTotal: {
        type: Number,
        required: true,
        min: 0
    },

    estado: {
        type: String,
        enum: ['Pendiente', 'Confirmada', 'Cancelada', 'Completada'],
        default: 'Pendiente'
    },

    participantes: [participanteSchema],

    notificacionEnviada: {
        type: Boolean,
        default: false
    },

    // Archivo adjunto de ficha médica (solo para actividades de riesgo Alto)
    fichaMedicaArchivo: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Reserva', reservaSchema);
