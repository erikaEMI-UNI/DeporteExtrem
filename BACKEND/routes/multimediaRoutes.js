const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const multimediaController = require('../controllers/multimediaController');
const { authorize } = require('../middlewares/authorize');
const Actividad = require('../models/Actividad');

// Ensure uploads directories exist
const uploadsDir = path.join(__dirname, '..', 'uploads', 'multimedia');
const modelos3dDir = path.join(__dirname, '..', 'uploads', 'modelos3d');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(modelos3dDir)) {
    fs.mkdirSync(modelos3dDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = /image\/.*|video\/.*|audio\/.*/;
    if (allowed.test(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo imágenes, videos y audio.'), false);
    }
};

const uploadMultimedia = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Gestión completa (solo admin)
router.post('/:id', authorize(['crear_multimedia']), uploadMultimedia.single('archivo'), multimediaController.agregarMultimedia);
router.delete('/:id', authorize(['eliminar_multimedia']), multimediaController.eliminarMultimedia);
router.get('/:id', authorize(['ver_multimedia']), multimediaController.obtenerMultimedia);
router.put('/:id/reordenar', authorize(['crear_multimedia']), multimediaController.reordenarMultimedia);
router.patch('/:id/item', authorize(['crear_multimedia']), multimediaController.actualizarItemMultimedia);

// ── Upload de modelo 3D (.glb / .fbx) ────────────────────────────────────────
const storage3d = multer.diskStorage({
    destination: (req, file, cb) => cb(null, modelos3dDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, uniqueSuffix + ext);
    },
});

const fileFilter3d = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.glb' || ext === '.fbx') {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos .glb y .fbx'), false);
    }
};

const uploadModelo3d = multer({
    storage: storage3d,
    fileFilter: fileFilter3d,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// Agregar modelo 3D al array
router.post('/:id/modelo3d', authorize(['editar_actividad']), uploadModelo3d.single('modelo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo' });

        const rutaRelativa = `uploads/modelos3d/${req.file.filename}`;
        const nombre = req.body.nombre?.trim() || 'Equipamiento';

        const actividad = await Actividad.findByIdAndUpdate(
            req.params.id,
            { $push: { modelos3d: { url: rutaRelativa, nombre } } },
            { new: true }
        );

        if (!actividad) return res.status(404).json({ error: 'Actividad no encontrada' });

        res.json({ modelos3d: actividad.modelos3d });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar un modelo 3D por su _id de subdocumento
router.delete('/:id/modelo3d/:modeloId', authorize(['editar_actividad']), async (req, res) => {
    try {
        const actividad = await Actividad.findById(req.params.id);
        if (!actividad) return res.status(404).json({ error: 'Actividad no encontrada' });

        const modelo = actividad.modelos3d.id(req.params.modeloId);
        if (!modelo) return res.status(404).json({ error: 'Modelo no encontrado' });

        // Borrar archivo físico
        const filePath = path.join(__dirname, '..', modelo.url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        modelo.deleteOne();
        await actividad.save();

        res.json({ modelos3d: actividad.modelos3d });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
