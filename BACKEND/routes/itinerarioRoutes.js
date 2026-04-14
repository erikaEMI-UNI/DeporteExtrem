const express = require('express');
const router = express.Router();
const itinerarioController = require('../controllers/itinerarioController');
const { authorize } = require('../middlewares/authorize');

router.post('/', authorize(['crear_itinerario']), itinerarioController.crearItinerario);
router.get('/', authorize(['ver_itinerarios']), itinerarioController.listarItinerarios);
router.put('/:id', authorize(['editar_itinerario']), itinerarioController.actualizarItinerario);
router.delete('/:id', authorize(['eliminar_itinerario']), itinerarioController.eliminarItinerario);

module.exports = router;
