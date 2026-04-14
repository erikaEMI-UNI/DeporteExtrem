//C:\Users\Hp\Desktop\erika\cod\V7_Proyect\proyec1F\BACKEND\routes\fechaRoutes.js

const express = require('express');
const router = express.Router({ mergeParams: true });
const fechaController = require('../controllers/fechaController');
const { verifyToken, authorize } = require('../middlewares/authorize');

/* ================= RUTAS PÚBLICAS ================= */
// Obtener fechas disponibles para una actividad (sin autenticación)
router.get('/disponibles', fechaController.obtenerFechasDisponibles);

/* ================= MIDDLEWARE GLOBAL ================= */
// Todas las rutas después requieren token
router.use(verifyToken);

/* ================= CRUD DE FECHAS ================= */

// Obtener todas las fechas de una actividad
router.get(
    '/',
    authorize(['ver_fechas', 'ver_actividad']),
    fechaController.obtenerFechas
);

// Agregar fecha a actividad
router.post(
    '/',
    authorize(['crear_fecha', 'editar_actividad']),
    fechaController.agregarFecha
);

// Verificar disponibilidad de una fecha específica
router.get(
    '/:fechaId/verificar',
    authorize(['ver_fechas']),
    fechaController.verificarDisponibilidad
);

// Actualizar fecha específica
router.put(
    '/:fechaId',
    authorize(['editar_fecha', 'editar_actividad']),
    fechaController.actualizarFecha
);

// Eliminar fecha específica
router.delete(
    '/:fechaId',
    authorize(['eliminar_fecha', 'editar_actividad']),
    fechaController.eliminarFecha
);

module.exports = router;