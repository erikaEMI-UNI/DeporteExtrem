const express  = require('express');
const router   = express.Router();
const path     = require('path');
const fs       = require('fs');
const multer   = require('multer');
const ctrl     = require('../controllers/categoriaController');
const { verifyToken, authorize } = require('../middlewares/authorize');
const Categoria = require('../models/Categoria');

// Directorio de modelos 3D (comparte carpeta con los de actividades)
const modelos3dDir = path.join(__dirname, '..', 'uploads', 'modelos3d');
if (!fs.existsSync(modelos3dDir)) fs.mkdirSync(modelos3dDir, { recursive: true });

const storage3d = multer.diskStorage({
    destination: (req, file, cb) => cb(null, modelos3dDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname).toLowerCase());
    },
});
const uploadModelo3d = multer({
    storage: storage3d,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        ext === '.glb' || ext === '.fbx'
            ? cb(null, true)
            : cb(new Error('Solo .glb y .fbx'), false);
    },
    limits: { fileSize: 100 * 1024 * 1024 },
});

// ── CRUD básico ──────────────────────────────────────────────────────────────
router.get('/',                          ctrl.listarCategorias);
router.post('/',                         verifyToken, authorize(['crear_categorias']),   ctrl.crearCategoria);
router.put('/:id',                       verifyToken, authorize(['editar_categorias']),  ctrl.actualizarCategoria);
router.delete('/:id',                    verifyToken, authorize(['eliminar_categorias']),ctrl.eliminarCategoria);
router.patch('/actividad/:id/categorias',verifyToken, authorize(['editar_actividades']), ctrl.asignarCategoriasActividad);

// ── Modelos 3D por categoría ─────────────────────────────────────────────────

// Agregar modelo 3D a una categoría
router.post('/:id/modelo3d', verifyToken, authorize(['editar_actividad']), uploadModelo3d.single('modelo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo' });

        const nombre = req.body.nombre?.trim() || 'Equipamiento';
        const url    = `uploads/modelos3d/${req.file.filename}`;

        const categoria = await Categoria.findByIdAndUpdate(
            req.params.id,
            { $push: { modelos3d: { url, nombre } } },
            { new: true }
        );
        if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });

        res.json({ modelos3d: categoria.modelos3d });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar un modelo 3D de una categoría
router.delete('/:id/modelo3d/:modeloId', verifyToken, authorize(['editar_actividad']), async (req, res) => {
    try {
        const categoria = await Categoria.findById(req.params.id);
        if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });

        const modelo = categoria.modelos3d.id(req.params.modeloId);
        if (!modelo) return res.status(404).json({ error: 'Modelo no encontrado' });

        const filePath = path.join(__dirname, '..', modelo.url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        modelo.deleteOne();
        await categoria.save();

        res.json({ modelos3d: categoria.modelos3d });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
