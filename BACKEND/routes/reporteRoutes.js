const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const { authorize } = require('../middlewares/authorize');

router.get('/reservas-por-actividad', authorize(['ver_reporte_reservas']), reporteController.reporteReservasPorActividad);
router.get('/estado-recursos', authorize(['ver_reporte_recursos']), reporteController.reporteEstadoRecursos);

module.exports = router;