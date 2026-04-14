const Historial = require('../models/Historial');

// Crear entrada de historial
exports.registrarAccion = async (usuarioId, accion, detalles) => {
    try {
        const registro = new Historial({
            usuario: usuarioId,
            accion,
            detalles
        });
        await registro.save();
    } catch (err) {
        console.error("Error al registrar historial:", err.message);
    }
};

// Obtener historial (admin)
exports.obtenerHistorial = async (req, res) => {
    try {
        const historial = await Historial.find().populate('usuario').sort({ fecha: -1 });
        res.json(historial);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
