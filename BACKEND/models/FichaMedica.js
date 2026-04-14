const mongoose = require('mongoose');

const fichaMedicaSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
        // unique eliminado: se permiten múltiples fichas por usuario (una por participante/reserva)
        // NOTA: si existe un índice único previo en MongoDB, ejecutar:
        //   db.fichamedicas.dropIndex({ usuario: 1 })
    },
    // Referencia a la reserva que originó esta ficha (null si fue creada manualmente)
    reservaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reserva',
        default: null
    },
    // Nombre del participante (del cuestionario de la reserva)
    nombreParticipante: {
        type: String,
        default: ''
    },
    grupoSanguineo: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
        default: ''
    },
    telefonoRespaldo: {
        type: String,
        default: ''
    },
    alergias: {
        type: [String],
        default: []
    },
    enfermedades: {
        type: [String],
        default: []
    },
    medicamentos: {
        type: [String],
        default: []
    },
    archivoPdf: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('FichaMedica', fichaMedicaSchema);
