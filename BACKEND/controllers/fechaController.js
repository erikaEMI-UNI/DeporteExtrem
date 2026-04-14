//C:\Users\Hp\Desktop\erika\cod\V7_Proyect\proyec1F\BACKEND\controllers\fechaController.js

const Actividad = require('../models/Actividad');
const { registrarAccion } = require('./historialController');

// Función helper para calcular duración
const calcularDuracion = (fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffMs = fin - inicio;
    const diffHoras = diffMs / (1000 * 60 * 60);
    
    if (diffHoras < 24) {
        return `${Math.round(diffHoras * 10) / 10} horas`;
    } else {
        const dias = Math.floor(diffHoras / 24);
        const horasRestantes = Math.round((diffHoras % 24) * 10) / 10;
        return horasRestantes > 0 ? `${dias} días ${horasRestantes} horas` : `${dias} días`;
    }
};

// Obtener todas las fechas de una actividad
exports.obtenerFechas = async (req, res) => {
    try {
        const { actividadId } = req.params;
        const { estado, desde, hasta } = req.query;

        const actividad = await Actividad.findById(actividadId).select('fechas');
        if (!actividad) {
            return res.status(404).json({ mensaje: 'Actividad no encontrada' });
        }

        let fechas = actividad.fechas || [];

        // Filtrar por estado
        if (estado) {
            fechas = fechas.filter(f => f.estado === estado);
        }

        // Filtrar por rango de fechas
        if (desde && hasta) {
            fechas = fechas.filter(f => 
                new Date(f.fechaInicio) >= new Date(desde) && 
                new Date(f.fechaInicio) <= new Date(hasta)
            );
        }

        // Ordenar por fecha de inicio (más recientes primero)
        fechas.sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));

        res.json(fechas);
    } catch (err) {
        console.error('Error en obtenerFechas:', err);
        res.status(500).json({ error: err.message });
    }
};

// Agregar fecha a una actividad
exports.agregarFecha = async (req, res) => {
    try {
        const { actividadId } = req.params;
        const { fechaInicio, fechaFin, capacidadDisponible, riesgos, estado } = req.body;

        const actividad = await Actividad.findById(actividadId);
        if (!actividad) {
            return res.status(404).json({ mensaje: 'Actividad no encontrada' });
        }

        // Validaciones
        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ error: 'Fecha de inicio y fin son requeridas' });
        }

        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        
        if (fin <= inicio) {
            return res.status(400).json({ error: 'La fecha de fin debe ser posterior a la fecha de inicio' });
        }

        if (!capacidadDisponible || capacidadDisponible < 1) {
            return res.status(400).json({ error: 'La capacidad debe ser mayor a 0' });
        }

        if (!riesgos || riesgos.length === 0) {
            return res.status(400).json({ error: 'Debe seleccionar al menos un nivel de riesgo' });
        }

        // Validar que no exista una fecha en el mismo rango
        const fechaExistente = actividad.fechas.some(f => 
            (new Date(f.fechaInicio) <= fin && new Date(f.fechaFin) >= inicio)
        );

        if (fechaExistente) {
            return res.status(400).json({ error: 'Ya existe una fecha en ese rango' });
        }

        // Calcular duración
        const duracion = calcularDuracion(fechaInicio, fechaFin);

        // Crear nueva fecha
        const nuevaFecha = {
            fechaInicio: inicio,
            fechaFin: fin,
            duracion,
            capacidadDisponible,
            riesgos,
            estado: estado || 'activa'
        };

        actividad.fechas.push(nuevaFecha);
        await actividad.save();

        await registrarAccion(req.user._id, `Agregó fecha a "${actividad.nombre}"`);

        // Devolver la fecha creada
        const fechaCreada = actividad.fechas[actividad.fechas.length - 1];
        res.status(201).json(fechaCreada);
    } catch (err) {
        console.error('Error en agregarFecha:', err);
        res.status(400).json({ error: err.message });
    }
};

// Actualizar una fecha específica
exports.actualizarFecha = async (req, res) => {
    try {
        const { actividadId, fechaId } = req.params;
        const { fechaInicio, fechaFin, capacidadDisponible, riesgos, estado } = req.body;

        const actividad = await Actividad.findById(actividadId);
        if (!actividad) {
            return res.status(404).json({ mensaje: 'Actividad no encontrada' });
        }

        const fechaIndex = actividad.fechas.findIndex(f => f._id.toString() === fechaId);
        if (fechaIndex === -1) {
            return res.status(404).json({ mensaje: 'Fecha no encontrada' });
        }

        // Actualizar campos
        if (fechaInicio) {
            actividad.fechas[fechaIndex].fechaInicio = new Date(fechaInicio);
        }
        if (fechaFin) {
            actividad.fechas[fechaIndex].fechaFin = new Date(fechaFin);
        }
        
        // Recalcular duración si cambiaron las fechas
        if (fechaInicio || fechaFin) {
            const inicio = actividad.fechas[fechaIndex].fechaInicio;
            const fin = actividad.fechas[fechaIndex].fechaFin;
            actividad.fechas[fechaIndex].duracion = calcularDuracion(inicio, fin);
        }
        
        if (capacidadDisponible !== undefined) {
            actividad.fechas[fechaIndex].capacidadDisponible = capacidadDisponible;
        }
        if (riesgos) {
            actividad.fechas[fechaIndex].riesgos = riesgos;
        }
        if (estado) {
            actividad.fechas[fechaIndex].estado = estado;
        }

        await actividad.save();
        await registrarAccion(req.user._id, `Actualizó fecha de "${actividad.nombre}"`);

        res.json(actividad.fechas[fechaIndex]);
    } catch (err) {
        console.error('Error en actualizarFecha:', err);
        res.status(400).json({ error: err.message });
    }
};

// Eliminar una fecha específica
exports.eliminarFecha = async (req, res) => {
    try {
        const { actividadId, fechaId } = req.params;

        const actividad = await Actividad.findById(actividadId);
        if (!actividad) {
            return res.status(404).json({ mensaje: 'Actividad no encontrada' });
        }

        const fechaIndex = actividad.fechas.findIndex(f => f._id.toString() === fechaId);
        if (fechaIndex === -1) {
            return res.status(404).json({ mensaje: 'Fecha no encontrada' });
        }

        actividad.fechas.splice(fechaIndex, 1);
        await actividad.save();

        await registrarAccion(req.user._id, `Eliminó fecha de "${actividad.nombre}"`);

        res.json({ mensaje: 'Fecha eliminada correctamente', fechaId });
    } catch (err) {
        console.error('Error en eliminarFecha:', err);
        res.status(400).json({ error: err.message });
    }
};

// Verificar disponibilidad de una fecha
exports.verificarDisponibilidad = async (req, res) => {
    try {
        const { actividadId, fechaId } = req.params;

        const actividad = await Actividad.findById(actividadId);
        if (!actividad) {
            return res.status(404).json({ mensaje: 'Actividad no encontrada' });
        }

        const fecha = actividad.fechas.find(f => f._id.toString() === fechaId);
        if (!fecha) {
            return res.status(404).json({ mensaje: 'Fecha no encontrada' });
        }

        res.json({
            disponible: fecha.estado === 'activa' && fecha.capacidadDisponible > 0,
            fecha,
            capacidadDisponible: fecha.capacidadDisponible,
            estado: fecha.estado
        });
    } catch (err) {
        console.error('Error en verificarDisponibilidad:', err);
        res.status(500).json({ error: err.message });
    }
};

// Obtener fechas disponibles para reserva (público)
exports.obtenerFechasDisponibles = async (req, res) => {
    try {
        const { actividadId } = req.params;

        const actividad = await Actividad.findById(actividadId).select('fechas nombre');
        if (!actividad) {
            return res.status(404).json({ mensaje: 'Actividad no encontrada' });
        }

        const fechasDisponibles = actividad.fechas
            .filter(f => f.estado === 'activa' && f.capacidadDisponible > 0)
            .map(f => ({
                _id: f._id,
                fechaInicio: f.fechaInicio,
                fechaFin: f.fechaFin,
                duracion: f.duracion,
                capacidadDisponible: f.capacidadDisponible,
                riesgos: f.riesgos
            }))
            .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));

        res.json({
            actividad: actividad.nombre,
            fechas: fechasDisponibles
        });
    } catch (err) {
        console.error('Error en obtenerFechasDisponibles:', err);
        res.status(500).json({ error: err.message });
    }
};