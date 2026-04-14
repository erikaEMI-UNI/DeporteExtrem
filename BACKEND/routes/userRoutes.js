// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authorize } = require('../middlewares/authorize');
const authController = require('../controllers/authController');


// Proteger todas las rutas con permisos y roles
router.get('/', authorize(['ver_usuarios']), userController.obtenerUsuarios);
router.post('/', authorize(['crear_usuarios']), authController.register);
router.get('/:id', authorize(['ver_usuario_especifico']), userController.obtenerUsuarioPorId);
router.put('/:id', authorize(['editar_usuarios']), userController.actualizarUsuario);
router.delete('/:id', authorize(['eliminar_usuarios']), userController.eliminarUsuario);
router.put('/:id/activar', authorize(['activar_usuarios']), userController.activarUsuario);
router.put('/:id/desactivar', authorize(['desactivar_usuarios']), userController.desactivarUsuario);
router.put('/:id/toggle-vip', authorize(['editar_usuarios']), userController.toggleVip);


module.exports = router;