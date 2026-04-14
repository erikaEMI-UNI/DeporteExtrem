// poligonoController.js
const PoligonoRiesgo = require('../models/PoligonoRiesgo');
const Actividad = require('../models/Actividad');
const geojsonValidation = require('geojson-validation');

// Variable para almacenar turf después de cargarlo
let turf = null;

// Función para cargar turf dinámicamente
const cargarTurf = async () => {
    if (!turf) {
        // Importación dinámica para ESM
        turf = await import('@turf/turf');
    }
    return turf;
};

// Obtener todos los polígonos de una actividad
exports.obtenerPoligonos = async (req, res) => {
    try {
        const { actividadId } = req.params;
        const poligonos = await PoligonoRiesgo.find({ actividadAsociada: actividadId });
        res.status(200).json(poligonos);
    } catch (error) {
        console.error('Error al obtener polígonos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Crear un nuevo polígono con validaciones geoespaciales
exports.crearPoligono = async (req, res) => {
    try {
        const turfModule = await cargarTurf();
        const { actividadId } = req.params;
        const { nombre, geometria, riesgo, temporada } = req.body;

        if (!geometria || geometria.type !== 'Polygon') {
            return res.status(400).json({ message: 'La geometría debe ser un Polygon de GeoJSON.' });
        }

        // 1. Validar GeoJSON válido según RFC 7946
        if (!geojsonValidation.isPolygon(geometria)) {
            return res.status(400).json({ message: 'El formato de Polygon no es válido según GeoJSON.' });
        }

        const feature = turfModule.polygon(geometria.coordinates);

        // 2. Verificar auto-intersecciones
        const intersecta = turfModule.kinks(feature);
        if (intersecta.features.length > 0) {
            return res.status(400).json({ message: 'El polígono tiene auto-intersecciones.' });
        }

        // 3. Detectar solapamientos con otros polígonos de la misma actividad
        const poligonosExistentes = await PoligonoRiesgo.find({ actividadAsociada: actividadId });
        for (const pol of poligonosExistentes) {
            const featureExistente = turfModule.polygon(pol.geometria.coordinates);
            try {
                // booleanOverlap checkea superposición parcial. intersect() busca si hay geometría de cruce.
                const intersection = turfModule.intersect(feature, featureExistente);
                if (intersection) {
                    return res.status(400).json({
                        message: `El polígono se solapa con el polígono existente '${pol.nombre}'.`
                    });
                }
            } catch (err) {
                console.error("Error validando overlap", err);
            }
        }

        // 4. Calcular el área en hectáreas
        const areaMetros = turfModule.area(feature);
        const areaHectareas = areaMetros / 10000;

        // 5. Guardar el nuevo Polígono
        const nuevoPoligono = new PoligonoRiesgo({
            nombre,
            geometria,
            riesgo,
            temporada,
            actividadAsociada: actividadId,
            areaHectareas,
            createdBy: req.user ? req.user.id : null
        });

        await nuevoPoligono.save();

        res.status(201).json({
            message: 'Polígono creado exitosamente',
            poligono: nuevoPoligono
        });
    } catch (error) {
        console.error('Error al crear polígono:', error);
        res.status(500).json({ message: 'Error interno del servidor. ' + error.message, error: error.stack });
    }
};

// Obtener un polígono por ID
exports.obtenerPoligonoPorId = async (req, res) => {
    try {
        const poligono = await PoligonoRiesgo.findById(req.params.id);
        if (!poligono) {
            return res.status(404).json({ message: 'Polígono no encontrado.' });
        }
        res.status(200).json(poligono);
    } catch (error) {
        console.error('Error al obtener el polígono:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Actualizar polígono
exports.actualizarPoligono = async (req, res) => {
    try {
        const turfModule = await cargarTurf();
        const { id } = req.params;
        const { nombre, geometria, riesgo, temporada } = req.body;

        const poligono = await PoligonoRiesgo.findById(id);
        if (!poligono) {
            return res.status(404).json({ message: 'Polígono no encontrado.' });
        }

        if (geometria) {
            if (geometria.type !== 'Polygon' || !geojsonValidation.isPolygon(geometria)) {
                return res.status(400).json({ message: 'Geometría inválida.' });
            }
            const feature = turfModule.polygon(geometria.coordinates);
            const intersecta = turfModule.kinks(feature);
            if (intersecta.features.length > 0) {
                return res.status(400).json({ message: 'El polígono tiene auto-intersecciones.' });
            }
            const areaMetros = turfModule.area(feature);
            poligono.areaHectareas = areaMetros / 10000;
            poligono.geometria = geometria;
        }

        if (nombre) poligono.nombre = nombre;
        if (riesgo) poligono.riesgo = riesgo;
        if (temporada) poligono.temporada = temporada;

        await poligono.save();

        res.status(200).json({ message: 'Polígono actualizado exitosamente', poligono });
    } catch (error) {
        console.error('Error al actualizar polígono:', error);
        res.status(500).json({ message: 'Error interno del servidor. ' + error.message, error: error.stack });
    }
};

// Eliminar polígono
exports.eliminarPoligono = async (req, res) => {
    try {
        const { id } = req.params;
        const poligono = await PoligonoRiesgo.findByIdAndDelete(id);
        if (!poligono) {
            return res.status(404).json({ message: 'Polígono no encontrado.' });
        }
        res.status(200).json({ message: 'Polígono eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar polígono:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};