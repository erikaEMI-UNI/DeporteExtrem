const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/reporteActividadController');
const { authorize } = require('../middlewares/authorize');

// Participantes para lista pre-salida (operador y admin)
router.get(
    '/participantes/:actividadId/:fecha',
    authorize(['ver_reservas']),
    ctrl.participantesPorFechaActividad
);

// CRUD reportes
router.get('/',     authorize(['ver_reportes_actividad']), ctrl.listarReportes);
router.get('/:id',  authorize(['ver_reportes_actividad']), ctrl.obtenerReporte);
router.post('/',    authorize(['crear_reporte_actividad']), ctrl.crearReporte);
router.put('/:id',  authorize(['crear_reporte_actividad']), ctrl.actualizarReporte);
router.post('/:id/enviar', authorize(['crear_reporte_actividad']), ctrl.enviarReporte);
router.delete('/:id', authorize(['crear_reporte_actividad']), ctrl.eliminarReporte);

module.exports = router;
