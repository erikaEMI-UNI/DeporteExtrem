const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
    nombre:      { type: String, required: true, unique: true, trim: true },
    descripcion: { type: String, default: '' },
    icono:       { type: String, default: '🏔️' },   // emoji representativo
    activo:      { type: Boolean, default: true },
    // Modelos 3D compartidos para todas las actividades de esta categoría
    modelos3d: [{
        url:    { type: String, required: true },
        nombre: { type: String, default: 'Equipamiento' },
    }],
}, { timestamps: true });

module.exports = mongoose.model('Categoria', categoriaSchema);
