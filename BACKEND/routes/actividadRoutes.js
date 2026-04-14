//C:\Users\Hp\Desktop\erika\cod\V7_Proyect\proyec1F\BACKEND\routes\actividadRoutes.js

const express = require('express');
const router = express.Router();
const actividadController = require('../controllers/actividadController');
const fechaRoutes = require('./fechaRoutes');
const poligonoRoutes = require('./poligonoRoutes');

const { verifyToken, authorize, optionalAuth } = require('../middlewares/authorize');

/* ================= RUTAS PÚBLICAS ================= */

// Ver actividades — token opcional: VIP ve todas, el resto solo activas
router.get('/public', optionalAuth, actividadController.listarActividades);

// Fechas activas de una actividad — público (para turistas al reservar)
router.get('/:id/fechas-publicas', actividadController.obtenerFechasPublicas);

/* ================= MIDDLEWARE GLOBAL ================= */

// Todas las rutas después requieren token
router.use(verifyToken);

/* ================= CRUD ACTIVIDADES ================= */

// Crear actividad (solo info básica)
router.post(
  '/',
  authorize(['crear_actividad']),
  actividadController.crearActividad
);

// Listar actividades (sin fechas)
router.get(
  '/',
  authorize(['listar_actividades']),
  actividadController.listarActividades
);

// Ver actividad por ID (con fechas)
router.get(
  '/:id',
  authorize(['ver_actividad']),
  actividadController.obtenerActividad
);

// Actualizar actividad (info básica)
router.put(
  '/:id',
  authorize(['editar_actividad']),
  actividadController.actualizarActividad
);

// Actualizar ficha técnica de una actividad
router.patch(
  '/:id/ficha-tecnica',
  authorize(['editar_actividad']),
  actividadController.actualizarFichaTecnica
);

// Eliminar actividad
router.delete(
  '/:id',
  authorize(['eliminar_actividad']),
  actividadController.eliminarActividad
);

/* ================= RUTAS DE FECHAS ================= */
/*
// Agregar fecha a actividad
router.post(
  '/:id/fechas',
  authorize(['crear_fecha', 'editar_actividad']),
  actividadController.agregarFecha
);

// Obtener todas las fechas de una actividad
router.get(
  '/:id/fechas',
  authorize(['ver_fechas', 'ver_actividad']),
  actividadController.obtenerFechas
);

// Verificar disponibilidad de una fecha específica
router.get(
  '/:id/fechas/:fechaId/verificar',
  authorize(['ver_fechas']),
  actividadController.verificarDisponibilidadFecha
);

// Actualizar fecha específica
router.put(
  '/:id/fechas/:fechaId',
  authorize(['editar_fecha', 'editar_actividad']),
  actividadController.actualizarFecha
);

// Eliminar fecha específica
router.delete(
  '/:id/fechas/:fechaId',
  authorize(['eliminar_fecha', 'editar_actividad']),
  actividadController.eliminarFecha
);*/


/* ================= RUTAS DE FECHAS Y POLÍGONOS ================= */
router.use('/:actividadId/fechas', fechaRoutes);
router.use('/:actividadId/poligonos', poligonoRoutes);

module.exports = router;