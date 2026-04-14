const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authorize } = require('../middlewares/authorize');

router.get('/', authorize(['ver_roles']), roleController.listarRoles);
router.post('/', authorize(['crear_roles']), roleController.crearRol);
router.put('/:id', authorize(['editar_roles']), roleController.actualizarRol);
router.delete('/:id', authorize(['eliminar_roles']), roleController.eliminarRol);

module.exports = router;
