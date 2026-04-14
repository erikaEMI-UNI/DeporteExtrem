const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/pasoItinerarioController');
const { verifyToken, authorize } = require('../middlewares/authorize');

// GET es público: turistas no autenticados pueden ver el itinerario de una actividad
router.get('/', ctrl.listarPasos);

// Las rutas de escritura requieren autenticación + permiso (admin)
router.post('/',           verifyToken, authorize(['crear_paso_itinerario']),    ctrl.crearPaso);

// Reordenar — debe ir ANTES de /:id para que Express no confunda "reordenar" como un id
router.put('/reordenar',   verifyToken, authorize(['editar_paso_itinerario']),   ctrl.reordenarPasos);

// Editar paso individual
router.put('/:id',         verifyToken, authorize(['editar_paso_itinerario']),   ctrl.actualizarPaso);

// Eliminar paso
router.delete('/:id',      verifyToken, authorize(['eliminar_paso_itinerario']), ctrl.eliminarPaso);

module.exports = router;
