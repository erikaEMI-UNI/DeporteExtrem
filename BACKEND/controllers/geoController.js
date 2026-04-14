const GeoBoundary  = require('../models/GeoBoundary');
const PoligonoRiesgo = require('../models/PoligonoRiesgo');

// GET /api/geo/bolivia?nivel=1&padre=GID_1_codigo
const obtenerLimites = async (req, res) => {
  try {
    const { nivel = 1, padre } = req.query;
    const query = { nivel: parseInt(nivel) };
    if (padre) query.codigoPadre = padre;

    const limites = await GeoBoundary.find(query).select('-__v -properties');

    const geojson = {
      type: 'FeatureCollection',
      features: limites.map(l => ({
        type: 'Feature',
        geometry: l.geometria,
        properties: {
          nombre:      l.nombre,
          nivel:       l.nivel,
          codigo:      l.codigo,
          codigoPadre: l.codigoPadre,
        },
      })),
    };

    res.json(geojson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/geo/bolivia/niveles
const obtenerNiveles = async (req, res) => {
  try {
    const NOMBRES = ['País', 'Departamentos', 'Provincias', 'Municipios'];
    const niveles = await GeoBoundary.distinct('nivel');
    const counts = await Promise.all(
      niveles.sort().map(async n => ({
        nivel: n,
        nombre: NOMBRES[n],
        total: await GeoBoundary.countDocuments({ nivel: n }),
      }))
    );
    res.json(counts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/geo/export?nivel=1&padre=codigo&nombre=texto
// Descarga el GeoJSON como archivo
const exportarZona = async (req, res) => {
  try {
    const { nivel, padre, nombre } = req.query;
    const query = {};
    if (nivel !== undefined) query.nivel = parseInt(nivel);
    if (padre)  query.codigoPadre = padre;
    if (nombre) query.nombre = new RegExp(nombre, 'i');

    const limites = await GeoBoundary.find(query).select('-__v');

    const geojson = {
      type: 'FeatureCollection',
      exportedAt: new Date().toISOString(),
      features: limites.map(l => ({
        type: 'Feature',
        geometry: l.geometria,
        properties: {
          nombre:      l.nombre,
          nivel:       l.nivel,
          codigo:      l.codigo,
          codigoPadre: l.codigoPadre,
        },
      })),
    };

    res.setHeader('Content-Type', 'application/geo+json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="bolivia_nivel${nivel ?? 'all'}.geojson"`
    );
    res.json(geojson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/geo/poligonos  → todos los polígonos de riesgo como GeoJSON (público)
const obtenerTodosPoligonos = async (req, res) => {
  try {
    const poligonos = await PoligonoRiesgo.find()
      .select('nombre riesgo temporada areaHectareas geometria actividadAsociada')
      .populate('actividadAsociada', 'nombre');

    const geojson = {
      type: 'FeatureCollection',
      features: poligonos.map(p => ({
        type: 'Feature',
        geometry: p.geometria,
        properties: {
          id:          p._id,
          nombre:      p.nombre,
          riesgo:      p.riesgo,
          temporada:   p.temporada,
          area:        p.areaHectareas,
          actividad:   p.actividadAsociada?.nombre ?? '',
        },
      })),
    };

    res.json(geojson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { obtenerLimites, obtenerNiveles, exportarZona, obtenerTodosPoligonos };
