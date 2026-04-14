const Role = require('../models/Role');
const Permission = require('../models/Permission');
const { registrarAccion } = require('./historialController'); // 👈 Importar función

// Listar roles con permisos poblados
exports.listarRoles = async (req, res) => {
    try {
        const roles = await Role.find().populate('permisos');
        res.json(roles);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener roles', error });
    }
};

// Crear nuevo rol
exports.crearRol = async (req, res) => {
    try {
        const { nombre, descripcion, permisos = [] } = req.body;

        const existe = await Role.findOne({ nombre });
        if (existe) return res.status(400).json({ msg: 'Rol ya existe' });

        // Validar permisos
        const permisosValidos = await Permission.find({ _id: { $in: permisos } });
        if (permisosValidos.length !== permisos.length) {
            return res.status(400).json({ msg: 'Uno o más permisos inválidos' });
        }

        const rol = new Role({ nombre, descripcion, permisos });
        await rol.save();

        await registrarAccion(req.user._id, 'Creó rol', { rolId: rol._id, nombre });

        res.status(201).json(await rol.populate('permisos'));
    } catch (error) {
        res.status(500).json({ msg: 'Error al crear rol', error });
    }
};

// Actualizar rol
exports.actualizarRol = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.permisos) {
            const permisosValidos = await Permission.find({ _id: { $in: updates.permisos } });
            if (permisosValidos.length !== updates.permisos.length) {
                return res.status(400).json({ msg: 'Uno o más permisos inválidos' });
            }
        }

        const rol = await Role.findByIdAndUpdate(id, updates, { new: true }).populate('permisos');
        if (!rol) return res.status(404).json({ msg: 'Rol no encontrado' });

        await registrarAccion(req.user._id, 'Actualizó rol', { rolId: rol._id });

        res.json(rol);
    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar rol', error });
    }
};

// Eliminar rol
exports.eliminarRol = async (req, res) => {
    try {
        const { id } = req.params;

        const rol = await Role.findByIdAndDelete(id);
        if (!rol) return res.status(404).json({ msg: 'Rol no encontrado' });

        await registrarAccion(req.user._id, 'Eliminó rol', { rolId: rol._id, nombre: rol.nombre });

        res.json({ msg: 'Rol eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al eliminar rol', error });
    }
};
