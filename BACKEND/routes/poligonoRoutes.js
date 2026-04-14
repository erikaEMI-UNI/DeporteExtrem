const express = require('express');
const router = express.Router({ mergeParams: true });
const poligonoController = require('../controllers/poligonoController');

// Las rutas ya vienen con verifyToken y authorize en actividadRoutes
// si se usa como: router.use('/:actividadId/poligonos', poligonoRoutes);

// Obtener todos los polígonos de una actividad
router.get('/', poligonoController.obtenerPoligonos);

// Crear un nuevo polígono
router.post('/', poligonoController.crearPoligono);

// Obtener un polígono específico
router.get('/:id', poligonoController.obtenerPoligonoPorId);

// Actualizar un polígono
router.put('/:id', poligonoController.actualizarPoligono);

// Eliminar un polígono
router.delete('/:id', poligonoController.eliminarPoligono);

module.exports = router;
