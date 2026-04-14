const Categoria = require('../models/Categoria');
const Actividad = require('../models/Actividad');

// GET /categorias — todas las categorías activas
exports.listarCategorias = async (req, res) => {
    try {
        const { todas } = req.query; // ?todas=true para incluir inactivas (admin)
        const filtro = todas === 'true' ? {} : { activo: true };
        const categorias = await Categoria.find(filtro).sort({ nombre: 1 });
        res.json(categorias);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /categorias — crear categoría
exports.crearCategoria = async (req, res) => {
    try {
        const { nombre, descripcion, icono } = req.body;
        if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es requerido' });

        const existe = await Categoria.findOne({ nombre: nombre.trim() });
        if (existe) return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });

        const categoria = await Categoria.create({
            nombre: nombre.trim(),
            descripcion: descripcion?.trim() || '',
            icono: icono?.trim() || '🏔️',
        });
        res.status(201).json(categoria);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PUT /categorias/:id — actualizar categoría
exports.actualizarCategoria = async (req, res) => {
    try {
        const { nombre, descripcion, icono, activo } = req.body;
        const categoria = await Categoria.findById(req.params.id);
        if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });

        if (nombre !== undefined) categoria.nombre      = nombre.trim();
        if (descripcion !== undefined) categoria.descripcion = descripcion.trim();
        if (icono !== undefined) categoria.icono        = icono.trim();
        if (activo !== undefined) categoria.activo      = activo;

        await categoria.save();
        res.json(categoria);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE /categorias/:id — eliminar categoría (y desvincula de actividades)
exports.eliminarCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.findById(req.params.id);
        if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });

        // Desvincular de todas las actividades que la usen
        await Actividad.updateMany(
            { categorias: categoria._id },
            { $pull: { categorias: categoria._id } }
        );

        await categoria.deleteOne();
        res.json({ mensaje: 'Categoría eliminada correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PATCH /categorias/:id/actividades — asignar/quitar categorías a una actividad
exports.asignarCategoriasActividad = async (req, res) => {
    try {
        const { categoriaIds } = req.body; // array de ObjectIds
        if (!Array.isArray(categoriaIds)) {
            return res.status(400).json({ error: 'categoriaIds debe ser un array' });
        }

        const actividad = await Actividad.findById(req.params.id);
        if (!actividad) return res.status(404).json({ error: 'Actividad no encontrada' });

        // Validar que todas las categorías existen
        const categoriasValidas = await Categoria.find({ _id: { $in: categoriaIds } }).select('_id');
        actividad.categorias = categoriasValidas.map(c => c._id);
        await actividad.save();

        await actividad.populate('categorias');
        res.json(actividad.categorias);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
