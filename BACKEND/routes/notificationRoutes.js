const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/notificationController');

router.get('/',              ctrl.listar);
router.get('/no-leidas',     ctrl.contarNoLeidas);
router.put('/leer-todas',    ctrl.marcarTodasLeidas);
router.put('/:id/leer',      ctrl.marcarLeida);

module.exports = router;
