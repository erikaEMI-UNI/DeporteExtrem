const express = require('express');
const router = express.Router();
const fichaController = require('../controllers/fichamedicaController');
const { authorize } = require('../middlewares/authorize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de multer con creación automática de carpeta
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/fichas_medicas';

        // Crear la carpeta si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = 'ficha_' + Date.now() + path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

// Configuración adicional de multer
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB límite
    },
    fileFilter: (req, file, cb) => {
        // Solo permitir archivos PDF
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF'), false);
        }
    }
});

// Rutas
// IMPORTANTE: las rutas con segmentos fijos deben ir ANTES que las dinámicas /:param
router.get('/', authorize(['ver_ficha_medica']), fichaController.listarTodasFichas);
router.post('/', authorize(['crear_ficha_medica']), upload.single('archivoPdf'), fichaController.crearFicha);
router.delete('/id/:fichaId', authorize(['eliminar_ficha_medica']), fichaController.eliminarFichaPorId);
router.get('/:usuarioId', authorize(['ver_ficha_medica']), fichaController.obtenerFicha);
router.put('/:usuarioId', authorize(['editar_ficha_medica']), upload.single('archivoPdf'), fichaController.actualizarFicha);
router.delete('/:usuarioId', authorize(['eliminar_ficha_medica']), fichaController.eliminarFicha);
router.get('/:usuarioId/descargar', authorize(['ver_ficha_medica']), fichaController.descargarFichaPdf);
router.get('/:usuarioId/ver-pdf', authorize(['ver_ficha_medica']), fichaController.verFichaPdf);

module.exports = router;