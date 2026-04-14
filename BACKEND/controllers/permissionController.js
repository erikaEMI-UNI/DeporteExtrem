const Permission = require('../models/Permission');
const { registrarAccion } = require('./historialController'); // 👈 Importa la función

// Listar todos los permisos
exports.listarPermisos = async (req, res) => {
    try {
        const permisos = await Permission.find();

        res.json(permisos);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener permisos', error });
    }
};

// Crear nuevo permiso
exports.crearPermiso = async (req, res) => {
    try {
        const { nombre, codename, descripcion } = req.body;

        const existe = await Permission.findOne({ codename });
        if (existe) return res.status(400).json({ msg: 'Permiso ya existe' });

        const permiso = new Permission({ nombre, codename, descripcion });
        await permiso.save();

        await registrarAccion(req.user._id, 'Creó permiso', { permisoId: permiso._id, codename });

        res.status(201).json(permiso);
    } catch (error) {
        res.status(500).json({ msg: 'Error al crear permiso', error });
    }
};

// Actualizar permiso
exports.actualizarPermiso = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const permiso = await Permission.findByIdAndUpdate(id, updates, { new: true });
        if (!permiso) return res.status(404).json({ msg: 'Permiso no encontrado' });

        await registrarAccion(req.user._id, 'Actualizó permiso', { permisoId: id });

        res.json(permiso);
    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar permiso', error });
    }
};

// Eliminar permiso
exports.eliminarPermiso = async (req, res) => {
    try {
        const { id } = req.params;

        const permiso = await Permission.findByIdAndDelete(id);
        if (!permiso) return res.status(404).json({ msg: 'Permiso no encontrado' });

        await registrarAccion(req.user._id, 'Eliminó permiso', { permisoId: id });

        res.json({ msg: 'Permiso eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al eliminar permiso', error });
    }
};
