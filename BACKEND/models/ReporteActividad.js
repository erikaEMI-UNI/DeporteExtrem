const mongoose = require('mongoose');

const participanteCheckSchema = new mongoose.Schema({
    nombre:     { type: String, required: true },
    reservaId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Reserva' },
    presente:   { type: Boolean, default: false },
}, { _id: false });

const reporteActividadSchema = new mongoose.Schema({
    actividad:   { type: mongoose.Schema.Types.ObjectId, ref: 'Actividad', required: true },
    fechaActividad: { type: Date, required: true },
    operador:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },

    // ── Pre-salida ──────────────────────────────────────────────────────────
    tipo: {
        type: String,
        enum: ['pre_salida', 'post_actividad'],
        required: true
    },
    participantesPresentes: [participanteCheckSchema],
    todosPresentes: { type: Boolean, default: false },

    // ── Post-actividad ──────────────────────────────────────────────────────
    participantesCompletos: { type: Boolean, default: null },
    equiposCompletos:       { type: Boolean, default: null },

    // ── Incidente ───────────────────────────────────────────────────────────
    huboIncidente: { type: Boolean, default: false },
    incidente: {
        descripcion:          { type: String, default: '' },
        atencionMedica:       { type: Boolean, default: false },
        atencionMedicaDetalle:{ type: String, default: '' },
        momento:              { type: String, default: '' },
        participanteAfectado: { type: String, default: '' },
    },

    observaciones: { type: String, default: '' },

    // ── Estado y prioridad ──────────────────────────────────────────────────
    estado: {
        type: String,
        enum: ['borrador', 'enviado'],
        default: 'borrador'
    },
    prioridad: {
        type: String,
        enum: ['normal', 'alta'],
        default: 'normal'
    },
    fechaEnvio:       { type: Date },
    notificadoAdmin:  { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('ReporteActividad', reporteActividadSchema);
