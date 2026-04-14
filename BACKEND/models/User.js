// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    ci: { type: String, required: true, unique: true },
    celular: { type: String, required: true, unique: true },
    ultimoLogin: { type: Date },
    activo: { type: Boolean, default: true },
    
    // ✅ IMPORTANTE: Deben ser ObjectIds, NO Strings
    roles: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Role'
    }],
    
    permisos: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Permission'  // ← Debe coincidir exactamente con el modelo
    }],
    
    esVip: { type: Boolean, default: false },

    tokenRecuperacion: { type: String },
    expiracionToken: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.validarPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);