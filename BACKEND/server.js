require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');
const initActividades = require('./utils/utilActividades');
const initAuth = require('./utils/utilPermisos');
const initUsuarios = require('./utils/utilUsuarios');
const initPermisosTurista = require('./utils/utilPermisosTurista');
const initPermisosOperador = require('./utils/utilPermisosOperador');
const initGADM            = require('./scripts/importGADM');
const initCategorias      = require('./utils/initCategorias');

///-----------------------------------
const poligonoRoutes = require('./routes/poligonoRoutes');


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Las rutas de polígonos deben estar anidadas bajo actividades
app.use('/api/actividades/:actividadId/poligonos', poligonoRoutes);


// Conectar a la BD y auto-inicializar
const startServer = async () => {
  try {
    // 1. Conectar a MongoDB
    await connectDB();

    // 2. Inicializar sistema de autenticación (siempre se ejecuta)
    await initAuth();
    await initPermisosTurista();
    await initPermisosOperador();

    // 3. Auto-inicializar actividades si la BD está vacía
    await initActividades();
    await initUsuarios();

    // 4. Crear categorías desde fichaTecnica y vincularlas (idempotente)
    await initCategorias();

    // 5. Importar límites GADM Bolivia (solo la primera vez)
    await initGADM();

    // 5. Definir rutas
    app.use('/api', routes);

    // 6. Iniciar servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error.message);
    process.exit(1);
  }
};

startServer();