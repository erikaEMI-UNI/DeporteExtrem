const FichaMedica = require('../models/FichaMedica');
const path = require('path');
const fs = require('fs');

// Listar TODAS las fichas médicas (admin/operador)
exports.listarTodasFichas = async (req, res) => {
    try {
        const fichas = await FichaMedica.find()
            .populate('usuario', 'nombre email')
            .sort({ createdAt: -1 });
        res.json(fichas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.crearFicha = async (req, res) => {
    try {
        const data = req.body;

        ['alergias', 'enfermedades', 'medicamentos'].forEach(field => {
            if (data[field] && typeof data[field] === 'string') {
                try {
                    data[field] = JSON.parse(data[field]);
                } catch { }
            }
        });

        if (req.file) {
            data.archivoPdf = req.file.path;
        }
        const ficha = new FichaMedica(data);
        await ficha.save();
        res.status(201).json(ficha);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.obtenerFicha = async (req, res) => {
    try {
        const ficha = await FichaMedica.findOne({ usuario: req.params.usuarioId });
        if (!ficha) return res.status(404).json({ error: 'Ficha no encontrada' });
        res.json(ficha);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.actualizarFicha = async (req, res) => {
    try {
        const data = req.body;
        if (req.file) {
            data.archivoPdf = req.file.path;
        }
        const ficha = await FichaMedica.findOneAndUpdate({ usuario: req.params.usuarioId }, data, { new: true });
        if (!ficha) return res.status(404).json({ error: 'Ficha no encontrada' });
        res.json(ficha);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Eliminar por usuario (compatibilidad antigua)
exports.eliminarFicha = async (req, res) => {
    try {
        const result = await FichaMedica.findOneAndDelete({ usuario: req.params.usuarioId });
        if (!result) return res.status(404).json({ error: 'Ficha no encontrada' });

        if (result.archivoPdf && fs.existsSync(result.archivoPdf)) {
            fs.unlinkSync(result.archivoPdf);
        }

        res.json({ mensaje: 'Ficha eliminada correctamente' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Eliminar por _id propio de la ficha (para tabla admin con múltiples fichas por usuario)
exports.eliminarFichaPorId = async (req, res) => {
    try {
        const result = await FichaMedica.findByIdAndDelete(req.params.fichaId);
        if (!result) return res.status(404).json({ error: 'Ficha no encontrada' });

        if (result.archivoPdf && fs.existsSync(result.archivoPdf)) {
            fs.unlinkSync(result.archivoPdf);
        }

        res.json({ mensaje: 'Ficha eliminada correctamente' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.descargarFichaPdf = async (req, res) => {
    try {
        const ficha = await FichaMedica.findOne({ usuario: req.params.usuarioId });
        if (!ficha || !ficha.archivoPdf) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        const rutaAbsoluta = path.resolve(ficha.archivoPdf);
        if (!fs.existsSync(rutaAbsoluta)) {
            return res.status(404).json({ error: 'Archivo no existe en el servidor' });
        }

        res.download(rutaAbsoluta);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.verFichaPdf = async (req, res) => {
    try {
        const ficha = await FichaMedica.findOne({ usuario: req.params.usuarioId });
        if (!ficha || !ficha.archivoPdf) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        const rutaAbsoluta = path.resolve(ficha.archivoPdf);
        if (!fs.existsSync(rutaAbsoluta)) {
            return res.status(404).json({ error: 'Archivo no existe en el servidor' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        fs.createReadStream(rutaAbsoluta).pipe(res);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
