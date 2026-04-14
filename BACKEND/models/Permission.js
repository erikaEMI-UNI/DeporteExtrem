// models/Permission.js
const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    codename: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    descripcion: { type: String }
}, { timestamps: true });

// ✅ IMPORTANTE: El nombre debe ser exactamente 'Permission'
module.exports = mongoose.model('Permission', permissionSchema);