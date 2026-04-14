const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');
const { authorize } = require('../middlewares/authorize');

// Solo admins
router.get('/', authorize(['ver_historial']), historialController.obtenerHistorial);

module.exports = router;
