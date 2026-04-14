const express = require('express');
const router  = express.Router();
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const reservaController = require('../controllers/reservaController');
const { authorize } = require('../middlewares/authorize');

// ── Multer: acepta ficha médica adjunta (solo para riesgo Alto) ──────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/fichas_medicas';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `ficha_reserva_${Date.now()}${path.extname(file.originalname)}`);
    },
});
const uploadFicha = multer({
    storage,
    limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Solo se permiten archivos PDF'), false);
    },
});

// Wrapper que captura errores de multer y devuelve JSON
const uploadFichaMiddleware = (req, res, next) => {
    uploadFicha.single('fichaMedica')(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'El archivo es demasiado grande. Máximo permitido: 30 MB.' });
            }
            return res.status(400).json({ error: err.message || 'Error al subir el archivo.' });
        }
        next();
    });
};

// Ruta pública: deportes más reservados (sin autenticación requerida)
router.get('/deportes-destacados', reservaController.getDeportesDestacados);

router.get('/', authorize(['ver_reservas']), reservaController.listarReservas);
router.get('/mis_reservas', authorize(['ver_mis_reservas'], ["turista"]), reservaController.misReservas);
router.post('/', authorize(['crear_reservas']), uploadFichaMiddleware, reservaController.crearReserva);
router.get('/:id', authorize(['ver_reserva_especifica']), reservaController.obtenerReserva);
router.put('/:id', authorize(['editar_reservas']), reservaController.actualizarReserva);
router.delete('/:id', authorize(['eliminar_reservas']), reservaController.eliminarReserva);

module.exports = router;
