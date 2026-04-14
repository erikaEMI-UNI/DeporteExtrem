/*Fechas disponibles
Capacidad por fecha
Precio por fecha
Estado por fecha
Zona de ubicación
Índices de fechas
el riesgo puede cambiar por fecha
*/
//C:\Users\Hp\Desktop\erika\cod\V7_Proyect\proyec1F\BACKEND\models\Actividad.js

const mongoose = require('mongoose');

const multimediaItemSchema = new mongoose.Schema({
    url:         { type: String, required: true },
    title:       { type: String, default: '' },
    description: { type: String, default: '' },
    order:       { type: Number, default: 0 },
    is_360:      { type: Boolean, default: false },
}, { _id: true });

const riesgoFechaSchema = new mongoose.Schema({
    nivel: {
        type: String,
        enum: ['Bajo', 'Medio', 'Alto'],
        required: true
    },
    precio: {
        type: Number,
        required: true,
        min: 0
    }
});

const fechaDisponibleSchema = new mongoose.Schema({
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaFin: {
        type: Date,
        required: true
    },
    duracion: {
        type: String,
        required: true
    },
    capacidadDisponible: {
        type: Number,
        required: true,
        min: 1
    },
    riesgos: [riesgoFechaSchema],
    estado: {
        type: String,
        enum: ['activa', 'inactiva', 'cancelada'],
        default: 'activa'
    }
}, { timestamps: true });

const fichaTecnicaSchema = new mongoose.Schema({
    duracion:          { type: String, default: '' },        // "Día completo", "4-6 horas"
    dificultad:        { type: String, default: '' },        // "Principiante" | "Intermedio" | "Avanzado" | "Experto"
    altitud:           { type: String, default: '' },        // "3.600 - 4.200 msnm"
    clima:             { type: String, default: '' },        // "Frío, 5 - 15 °C"
    equipoNecesario:   { type: [String], default: [] },      // ["Casco", "Chaleco salvavidas", ...]
    edadMinima:        { type: Number, default: null },      // 14
    requisitosFisicos: { type: String, default: '' },        // "Buena condición física"
    categoria:         { type: String, default: '' },        // "Rafting", "Senderismo"
    temporada:         { type: String, default: '' },        // "Mayo - Octubre"
    incluye:           { type: [String], default: [] },      // ["Guía certificado", "Equipo básico"]
    noIncluye:         { type: [String], default: [] },      // ["Transporte", "Alimentación"]
    puntoEncuentro:    { type: String, default: '' },        // "Plaza Mayor de La Paz"
}, { _id: false });

const actividadSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    descripcion: { type: String, required: true },
    recomendaciones: { type: String },

    categorias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' }],

    fichaTecnica: { type: fichaTecnicaSchema, default: () => ({}) },

    multimedia: {
        imagenes:        [multimediaItemSchema],
        videos:          [multimediaItemSchema],
        panoramicas:     [multimediaItemSchema],
        videos360:       [multimediaItemSchema],
        audio:           [multimediaItemSchema],
        enlacesInternos: [multimediaItemSchema],
    },
    ubicacion: {
        zona: { type: String, required: true, default: "Sin zona" },
        //// default: "Sin zona" quitar produccion
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    activo: { type: Boolean, default: false },

    // Descuento aplicable sobre el precio por nivel de riesgo
    descuento:       { type: Number, default: 0, min: 0, max: 100 },
    enDescuento:     { type: Boolean, default: false },

    // Precio fijo especial para usuarios VIP
    tieneVip:        { type: Boolean, default: false },
    precioVip:       { type: Number,  default: 0, min: 0 },

    // Modelos 3D del equipamiento (array de piezas)
    modelos3d: [{
        url:    { type: String, required: true },
        nombre: { type: String, default: 'Equipamiento' },
    }],

    // Gestión de fechas
    fechas: [fechaDisponibleSchema]

}, { timestamps: true });

// Índices
actividadSchema.index({ ubicacion: '2dsphere' });
actividadSchema.index({ 'fechas.fechaInicio': 1 });
actividadSchema.index({ 'fechas.estado': 1 });

module.exports = mongoose.model('Actividad', actividadSchema);