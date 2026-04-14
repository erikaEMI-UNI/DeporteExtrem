const Actividad = require('../models/Actividad');
const { registrarAccion } = require('./historialController');

const TIPOS_VALIDOS = ['imagenes', 'videos', 'panoramicas', 'videos360', 'audio', 'enlacesInternos'];

// Agregar multimedia a una actividad (soporta subdocumentos + multer file upload)
exports.agregarMultimedia = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo, url, title = '', description = '', order = 0, is_360 = false } = req.body;

        if (!TIPOS_VALIDOS.includes(tipo)) {
            return res.status(400).json({ error: 'Tipo de multimedia no válido' });
        }

        // Verificar que existe antes de modificar
        const existe = await Actividad.exists({ _id: id });
        if (!existe) return res.status(404).json({ mensaje: 'Actividad no encontrada' });

        let itemUrl = url;
        if (req.file) {
            itemUrl = `uploads/multimedia/${req.file.filename}`;
        }

        if (!itemUrl) {
            return res.status(400).json({ error: 'Se requiere URL o archivo' });
        }

        const nuevoItem = {
            url: itemUrl,
            title: title || '',
            description: description || '',
            order: Number(order) || 0,
            is_360: is_360 === true || is_360 === 'true',
        };

        const actividad = await Actividad.findByIdAndUpdate(
            id,
            { $push: { [`multimedia.${tipo}`]: nuevoItem } },
            { new: true, runValidators: false }
        );

        await registrarAccion(req.user._id, `Agregó un archivo a ${tipo} en la actividad "${actividad.nombre}"`);

        res.json(actividad.multimedia);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar multimedia específica de una actividad por subdocument _id
exports.eliminarMultimedia = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo, itemId } = req.body;

        if (!TIPOS_VALIDOS.includes(tipo)) {
            return res.status(400).json({ error: 'Tipo de multimedia no válido' });
        }

        if (!itemId) {
            return res.status(400).json({ error: 'Se requiere itemId' });
        }

        const actividad = await Actividad.findById(id);
        if (!actividad) return res.status(404).json({ mensaje: 'Actividad no encontrada' });

        const subDoc = actividad.multimedia[tipo].id(itemId);
        if (!subDoc) {
            return res.status(404).json({ error: 'Elemento no encontrado' });
        }

        subDoc.deleteOne();
        await actividad.save();

        await registrarAccion(req.user._id, `Eliminó un archivo de ${tipo} en la actividad "${actividad.nombre}"`);

        res.json(actividad.multimedia);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener la multimedia de una actividad
exports.obtenerMultimedia = async (req, res) => {
    try {
        const actividad = await Actividad.findById(req.params.id, 'multimedia');
        if (!actividad) return res.status(404).json({ mensaje: 'Actividad no encontrada' });

        res.json(actividad.multimedia);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Reordenar items de un tipo de multimedia
exports.reordenarMultimedia = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo, items } = req.body;

        if (!TIPOS_VALIDOS.includes(tipo)) {
            return res.status(400).json({ error: 'Tipo de multimedia no válido' });
        }

        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'items debe ser un array de { _id, order }' });
        }

        const actividad = await Actividad.findById(id);
        if (!actividad) return res.status(404).json({ mensaje: 'Actividad no encontrada' });

        items.forEach(({ _id, order }) => {
            const subDoc = actividad.multimedia[tipo].id(_id);
            if (subDoc) {
                subDoc.order = Number(order) || 0;
            }
        });

        await actividad.save();

        await registrarAccion(req.user._id, `Reordenó ${tipo} en la actividad "${actividad.nombre}"`);

        res.json(actividad.multimedia);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar metadatos de un item multimedia
exports.actualizarItemMultimedia = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo, itemId, title, description, is_360 } = req.body;

        if (!TIPOS_VALIDOS.includes(tipo)) {
            return res.status(400).json({ error: 'Tipo de multimedia no válido' });
        }

        if (!itemId) {
            return res.status(400).json({ error: 'Se requiere itemId' });
        }

        const actividad = await Actividad.findById(id);
        if (!actividad) return res.status(404).json({ mensaje: 'Actividad no encontrada' });

        const subDoc = actividad.multimedia[tipo].id(itemId);
        if (!subDoc) {
            return res.status(404).json({ error: 'Elemento no encontrado' });
        }

        if (title !== undefined) subDoc.title = title;
        if (description !== undefined) subDoc.description = description;
        if (is_360 !== undefined) subDoc.is_360 = is_360 === true || is_360 === 'true';

        await actividad.save();

        await registrarAccion(req.user._id, `Actualizó metadatos de ${tipo} en la actividad "${actividad.nombre}"`);

        res.json(actividad.multimedia);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
