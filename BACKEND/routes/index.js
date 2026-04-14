const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authorize');

// Rutas públicas y protegidas
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const roleRoutes = require('./roleRoutes');
const permissionRoutes = require('./permissionRoutes');
const actividadRoutes = require('./actividadRoutes');
const reservaRoutes = require('./reservaRoutes');
const historialRoutes = require('./historialRoutes');
const multimediaRoutes = require('./multimediaRoutes');
const itinerarioRoutes = require('./itinerarioRoutes');
const fichaMedicaRoutes = require('./fichaMedicaRoutes');
const reporteRoutes          = require('./reporteRoutes');
const reporteActividadRoutes = require('./reporteActividadRoutes');
const geoRoutes              = require('./geoRoutes');
const notificationRoutes     = require('./notificationRoutes');
const pasoItinerarioRoutes   = require('./pasoItinerarioRoutes');
const categoriaRoutes        = require('./categoriaRoutes');

// Ruta base
router.get('/', (req, res) => res.json({ msg: 'API de ERIKA' }));

// Rutas públicas
router.use('/auth', authRoutes);

// Rutas protegidas
router.use('/usuarios', verifyToken, userRoutes);
router.use('/roles', verifyToken, roleRoutes);
router.use('/permisos', verifyToken, permissionRoutes);
router.use('/actividades', actividadRoutes); // Algunas públicas, algunas protegidas
router.use('/reservas', verifyToken, reservaRoutes); // protegidas por verifyToken y authorize
router.use('/historial', verifyToken, historialRoutes); // solo admin
router.use('/multimedia', verifyToken, multimediaRoutes); // solo admin
router.use('/itinerarios', verifyToken, itinerarioRoutes); // solo admin
router.use('/fichas-medicas', verifyToken, fichaMedicaRoutes); // solo admin
router.use('/reportes',           verifyToken, reporteRoutes);          // solo admin
router.use('/reportes-actividad', verifyToken, reporteActividadRoutes); // operador + admin
router.use('/geo',                geoRoutes);                           // público: límites geográficos Bolivia
router.use('/notificaciones',     verifyToken, notificationRoutes);
router.use('/pasos-itinerario',   pasoItinerarioRoutes); // GET público; POST/PUT/DELETE protegidos internamente
router.use('/categorias',         categoriaRoutes);      // GET público; CRUD solo admin


module.exports = router;
