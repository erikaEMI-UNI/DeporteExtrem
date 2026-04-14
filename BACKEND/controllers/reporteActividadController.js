const ReporteActividad = require('../models/ReporteActividad');
const Reserva          = require('../models/Reserva');
const Actividad        = require('../models/Actividad');
const { registrarAccion } = require('./historialController');
const { crearNotificacionesAdmins } = require('./notificationController');

// ── Listar reportes (admin ve todos, operador ve los propios) ────────────────
exports.listarReportes = async (req, res) => {
    try {
        const esAdmin = req.user.roles.includes('admin');
        const filtro  = esAdmin ? {} : { operador: req.user._id };

        const reportes = await ReporteActividad.find(filtro)
            .populate('actividad', 'nombre')
            .populate('operador',  'nombre email')
            .sort({ createdAt: -1 });

        res.json(reportes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── Obtener un reporte por id ────────────────────────────────────────────────
exports.obtenerReporte = async (req, res) => {
    try {
        const reporte = await ReporteActividad.findById(req.params.id)
            .populate('actividad', 'nombre')
            .populate('operador',  'nombre email');

        if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });

        const esAdmin   = req.user.roles.includes('admin');
        const esPropio  = reporte.operador._id.toString() === req.user._id.toString();
        if (!esAdmin && !esPropio) return res.status(403).json({ error: 'Sin permiso' });

        res.json(reporte);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── Participantes de una actividad en una fecha (para pre-salida) ────────────
exports.participantesPorFechaActividad = async (req, res) => {
    try {
        const { actividadId, fecha } = req.params;

        const inicio = new Date(fecha + 'T00:00:00');
        const fin    = new Date(fecha + 'T23:59:59');

        const reservas = await Reserva.find({
            actividad:      actividadId,
            fechaActividad: { $gte: inicio, $lte: fin },
            estado:         { $in: ['Pendiente', 'Confirmada'] },
        }).populate('usuario', 'nombre');

        // Expandir participantes de cada reserva
        const lista = [];
        for (const reserva of reservas) {
            if (reserva.participantes && reserva.participantes.length > 0) {
                reserva.participantes.forEach(p => {
                    lista.push({
                        nombre:    p.nombre,
                        reservaId: reserva._id,
                        presente:  false,
                    });
                });
            } else {
                // Si no tiene array de participantes, usar el titular
                lista.push({
                    nombre:    reserva.usuario?.nombre || 'Participante',
                    reservaId: reserva._id,
                    presente:  false,
                });
            }
        }

        res.json({ participantes: lista, total: lista.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── Crear reporte (borrador) ─────────────────────────────────────────────────
exports.crearReporte = async (req, res) => {
    try {
        const {
            actividad, fechaActividad, tipo,
            participantesPresentes, todosPresentes,
            participantesCompletos, equiposCompletos,
            huboIncidente, incidente, observaciones,
        } = req.body;

        // Validar actividad
        const act = await Actividad.findById(actividad);
        if (!act) return res.status(404).json({ error: 'Actividad no encontrada' });

        const reporte = new ReporteActividad({
            actividad,
            fechaActividad: new Date(fechaActividad),
            operador:       req.user._id,
            tipo,
            participantesPresentes: participantesPresentes || [],
            todosPresentes:         todosPresentes || false,
            participantesCompletos,
            equiposCompletos,
            huboIncidente:  huboIncidente || false,
            incidente:      incidente || {},
            observaciones:  observaciones || '',
            prioridad:      huboIncidente ? 'alta' : 'normal',
            estado:         'borrador',
        });

        await reporte.save();
        await registrarAccion(req.user._id, `Creó reporte ${tipo} para "${act.nombre}"`);

        res.status(201).json(reporte);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ── Actualizar reporte (borrador) ────────────────────────────────────────────
exports.actualizarReporte = async (req, res) => {
    try {
        const reporte = await ReporteActividad.findById(req.params.id);
        if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });

        if (reporte.estado === 'enviado')
            return res.status(400).json({ error: 'No se puede editar un reporte ya enviado' });

        const campos = [
            'participantesPresentes','todosPresentes',
            'participantesCompletos','equiposCompletos',
            'huboIncidente','incidente','observaciones',
        ];
        campos.forEach(c => { if (req.body[c] !== undefined) reporte[c] = req.body[c]; });

        // Re-calcular prioridad
        reporte.prioridad = reporte.huboIncidente ? 'alta' : 'normal';

        await reporte.save();
        res.json(reporte);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ── Enviar reporte al administrador ─────────────────────────────────────────
exports.enviarReporte = async (req, res) => {
    try {
        const reporte = await ReporteActividad.findById(req.params.id)
            .populate('actividad', 'nombre')
            .populate('operador',  'nombre');

        if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
        if (reporte.estado === 'enviado')
            return res.status(400).json({ error: 'El reporte ya fue enviado' });

        // Actualizar campos finales del body si vienen
        const campos = [
            'participantesPresentes','todosPresentes',
            'participantesCompletos','equiposCompletos',
            'huboIncidente','incidente','observaciones',
        ];
        campos.forEach(c => { if (req.body[c] !== undefined) reporte[c] = req.body[c]; });

        reporte.estado          = 'enviado';
        reporte.fechaEnvio      = new Date();
        reporte.notificadoAdmin = true;
        reporte.prioridad       = reporte.huboIncidente ? 'alta' : 'normal';

        await reporte.save();

        // Crear notificaciones para los admins según el tipo
        if (reporte.tipo === 'pre_salida') {
            const presentes = (reporte.participantesPresentes || []).filter(p => p.presente).length;
            const total     = (reporte.participantesPresentes || []).length;
            await crearNotificacionesAdmins({
                tipo:     'confirmacion_salida',
                titulo:   `✅ Salida confirmada — ${reporte.actividad.nombre}`,
                mensaje:  `${reporte.operador.nombre} confirmó la salida: ${presentes}/${total} participantes presentes.`,
                prioridad:'normal',
                datos:    { reporteId: reporte._id, actividadNombre: reporte.actividad.nombre },
            });
        }

        if (reporte.tipo === 'post_actividad' && !reporte.huboIncidente) {
            await crearNotificacionesAdmins({
                tipo:     'confirmacion_salida',
                titulo:   `📝 Reporte post-actividad — ${reporte.actividad.nombre}`,
                mensaje:  `${reporte.operador.nombre} envió el reporte final de la actividad.${reporte.observaciones ? ` Obs: ${reporte.observaciones.slice(0, 80)}` : ''}`,
                prioridad:'normal',
                datos:    { reporteId: reporte._id, actividadNombre: reporte.actividad.nombre },
            });
        }

        if (reporte.huboIncidente) {
            await crearNotificacionesAdmins({
                tipo:     'incidente',
                titulo:   `🚨 INCIDENTE en ${reporte.actividad.nombre}`,
                mensaje:  reporte.incidente?.descripcion || 'Incidente reportado. Ver reporte para detalles.',
                prioridad:'alta',
                datos:    { reporteId: reporte._id, actividadNombre: reporte.actividad.nombre },
            });
        }

        const accion = reporte.huboIncidente
            ? `⚠️ INCIDENTE REPORTADO en "${reporte.actividad.nombre}" por ${reporte.operador.nombre}`
            : `Reporte post-actividad enviado para "${reporte.actividad.nombre}"`;

        await registrarAccion(req.user._id, accion, {
            reporteId:    reporte._id,
            tipo:         reporte.tipo,
            huboIncidente:reporte.huboIncidente,
            prioridad:    reporte.prioridad,
        });

        res.json({ msg: 'Reporte enviado al administrador', reporte });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── Eliminar reporte (solo borradores, solo admin) ───────────────────────────
exports.eliminarReporte = async (req, res) => {
    try {
        const reporte = await ReporteActividad.findById(req.params.id);
        if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
        if (reporte.estado === 'enviado' && !req.user.roles.includes('admin'))
            return res.status(403).json({ error: 'Solo el admin puede eliminar reportes enviados' });

        await ReporteActividad.deleteOne({ _id: reporte._id });
        await registrarAccion(req.user._id, 'Eliminó reporte de actividad');
        res.json({ msg: 'Reporte eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
