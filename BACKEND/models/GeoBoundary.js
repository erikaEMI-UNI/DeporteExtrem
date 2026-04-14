const mongoose = require('mongoose');

const GeoBoundarySchema = new mongoose.Schema({
  nombre:      { type: String, required: true },
  nivel:       { type: Number, required: true, enum: [0, 1, 2, 3] },
  codigo:      { type: String },          // GID_0 … GID_3
  codigoPadre: { type: String },          // GID del nivel superior
  geometria: {
    type:        { type: String, enum: ['Polygon', 'MultiPolygon'], required: true },
    coordinates: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  properties: { type: mongoose.Schema.Types.Mixed },  // extras del GADM
});

GeoBoundarySchema.index({ geometria: '2dsphere' });
GeoBoundarySchema.index({ nivel: 1, nombre: 1 });
GeoBoundarySchema.index({ nivel: 1, codigoPadre: 1 });

module.exports = mongoose.model('GeoBoundary', GeoBoundarySchema);
