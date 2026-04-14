// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const { verifyToken } = require('../middlewares/authorize');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/recuperar', authController.solicitarRecuperacion);
router.post('/restablecer/:token', authController.restablecerPassword);
// Ruta única /me — retorna usuario + permisos combinados (rol + directos)
router.get('/me', verifyToken, userController.obtenerDatosUsuario);

module.exports = router;
