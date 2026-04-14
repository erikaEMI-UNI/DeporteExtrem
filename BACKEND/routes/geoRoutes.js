const express = require('express');
const router = express.Router();
const { obtenerLimites, obtenerNiveles, exportarZona, obtenerTodosPoligonos } = require('../controllers/geoController');

// Rutas públicas (sólo lectura de datos geográficos)
router.get('/bolivia/niveles', obtenerNiveles);        // info sobre qué niveles hay cargados
router.get('/bolivia',         obtenerLimites);        // ?nivel=1&padre=BOL.1_1
router.get('/export',          exportarZona);          // ?nivel=1&padre=...  → descarga .geojson
router.get('/poligonos',       obtenerTodosPoligonos); // todos los polígonos de riesgo

module.exports = router;
