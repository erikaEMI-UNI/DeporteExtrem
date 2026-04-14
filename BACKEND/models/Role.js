const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },      // Ejemplo: 'admin'
    descripcion: { type: String },
    permisos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }] // Referencia a permisos
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
