const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { authorize } = require('../middlewares/authorize');

// Protegemos todas las rutas con permisos
router.get('/', authorize(['ver_permisos']), permissionController.listarPermisos);
router.post('/', authorize(['crear_permisos']), permissionController.crearPermiso);
router.put('/:id', authorize(['editar_permisos']), permissionController.actualizarPermiso);
router.delete('/:id', authorize(['eliminar_permisos']), permissionController.eliminarPermiso);

module.exports = router;
