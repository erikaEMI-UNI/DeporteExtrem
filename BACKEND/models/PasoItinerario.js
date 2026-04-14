const mongoose = require('mongoose');

const ubicacionSchema = new mongoose.Schema({
  nombre: { type: String, default: '' },
  lat:    { type: Number, default: null },
  lng:    { type: Number, default: null },
}, { _id: false });

const pasoItinerarioSchema = new mongoose.Schema({
  actividad:   { type: mongoose.Schema.Types.ObjectId, ref: 'Actividad', required: true },
  titulo:      { type: String, required: true, trim: true },
  descripcion: { type: String, default: '' },
  hora:        { type: String, default: '' },       // "08:30"
  duracion:    { type: String, default: '' },       // "2 horas"
  tipo: {
    type: String,
    enum: ['inicio', 'transporte', 'actividad', 'descanso', 'comida', 'fin', 'otro'],
    default: 'otro',
  },
  ubicacion: { type: ubicacionSchema, default: () => ({}) },
  order:     { type: Number, default: 0 },
  notas:     { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('PasoItinerario', pasoItinerarioSchema);
