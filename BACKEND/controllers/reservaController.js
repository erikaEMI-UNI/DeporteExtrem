const Reserva = require('../models/Reserva');
const Actividad = require('../models/Actividad');
const FichaMedica = require('../models/FichaMedica');
const User = require('../models/User');
const { registrarAccion } = require('./historialController');
const { crearNotificacionesAdmins, crearNotificacionesOperadores } = require('./notificationController');

// Crear nueva reserva
exports.crearReserva = async (req, res) => {
    try {
        // Soporta JSON puro y FormData (cuando viene fichaMedica adjunta)
        let body = req.body;
        if (req.body?.data) {
            try { body = JSON.parse(req.body.data); } catch { /* usa req.body tal cual */ }
        }

        const {
            actividad, tipoTour, fechaActividad,
            nivelRiesgo, precioBase, numeroPersonas, categoria,
            costoTotal, participantes
        } = body;

        // fechaId puede venir vacío (VIP no selecciona slot) → tratar como undefined
        const fechaId = body.fechaId && body.fechaId.toString().trim() !== '' ? body.fechaId : undefined;

        const usuarioId = req.user._id;

        // 1. Validar usuario activo
        const usuarioExistente = await User.findById(usuarioId);
        if (!usuarioExistente || !usuarioExistente.activo) {
            return res.status(400).json({ error: 'Usuario no válido o inactivo.' });
        }

        // 2. Validar actividad (VIP puede reservar aunque esté inactiva)
        const actividadExistente = await Actividad.findById(actividad);
        if (!actividadExistente) {
            return res.status(400).json({ error: 'Actividad no encontrada.' });
        }
        if (!actividadExistente.activo && !actividadExistente.tieneVip) {
            return res.status(400).json({ error: 'Actividad no válida o inactiva.' });
        }

        // 3. Validar que la fecha no sea en el pasado
        const fechaReserva = new Date(fechaActividad);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (isNaN(fechaReserva.getTime()) || fechaReserva < hoy) {
            return res.status(400).json({ error: 'No se puede reservar una fecha pasada o inválida.' });
        }

        // 4. Validar slot — el tour VIP usa calendario libre (sin slot obligatorio)
        if (fechaId && tipoTour !== 'VIP') {
            const slot = actividadExistente.fechas.id(fechaId);
            if (!slot) {
                return res.status(400).json({ error: 'El período seleccionado no existe.' });
            }
            const slotInicio = new Date(slot.fechaInicio); slotInicio.setHours(0,0,0,0);
            const slotFin    = new Date(slot.fechaFin);    slotFin.setHours(23,59,59,999);
            if (fechaReserva < slotInicio || fechaReserva > slotFin) {
                return res.status(400).json({ error: 'La fecha elegida no está dentro del período disponible.' });
            }
            if (slot.estado !== 'activa') {
                return res.status(400).json({ error: 'El período seleccionado ya no está activo.' });
            }

            // Validar capacidad del slot
            const reservasEnSlot = await Reserva.find({
                actividad,
                fechaId,
                estado: { $in: ['Pendiente', 'Confirmada'] }
            });
            const ocupados = reservasEnSlot.reduce((sum, r) => sum + r.numeroPersonas, 0);
            const disponibles = slot.capacidadDisponible - ocupados;
            if (numeroPersonas > disponibles) {
                return res.status(400).json({
                    error: `Solo hay ${disponibles} lugar(es) disponible(s) para este período.`
                });
            }
        }

        // 5. Validar que no exista reserva duplicada (misma actividad + mismo día)
        const reservaExistente = await Reserva.findOne({
            usuario: usuarioId,
            actividad,
            fechaActividad: fechaReserva,
            estado: { $ne: 'Cancelada' }
        });
        if (reservaExistente) {
            return res.status(400).json({ error: 'Ya tienes una reserva para esta actividad en esa fecha.' });
        }

        // 6. Crear reserva
        const reserva = new Reserva({
            usuario:        usuarioId,
            actividad,
            fechaId,
            fechaActividad: fechaReserva,
            tipoTour,
            nivelRiesgo,
            precioBase:     precioBase || 0,
            numeroPersonas,
            categoria,
            costoTotal,
            participantes:  participantes || [],
            estado:         'Pendiente',
            fichaMedicaArchivo: req.file ? req.file.filename : '',
        });

        await reserva.save();

        // 7. Crear fichas médicas automáticas para cada participante
        if (participantes && participantes.length > 0) {
            const fichasParaCrear = participantes.map(p => ({
                usuario:            usuarioId,
                reservaId:          reserva._id,
                nombreParticipante: p.nombre || '',
                grupoSanguineo:     p.grupoSanguineo || '',
                telefonoRespaldo:   p.telefonoRespaldo || '',
                alergias:           p.alergias    && p.alergiasDetalle    ? [p.alergiasDetalle]    : [],
                enfermedades:       p.enfermedad  && p.enfermedadDetalle  ? [p.enfermedadDetalle]  : [],
                medicamentos:       p.medicamento && p.medicamentoDetalle ? [p.medicamentoDetalle] : [],
                archivoPdf:         reserva.fichaMedicaArchivo || '',
            }));
            try {
                await FichaMedica.insertMany(fichasParaCrear, { ordered: false });
            } catch (fichaErr) {
                // No interrumpir la reserva si falla la creación de fichas
                console.warn('⚠️ Advertencia al crear fichas médicas:', fichaErr.message);
            }
        }

        // Registrar acción en historial
        await registrarAccion(usuarioId, 'Creó reserva', {
            reservaId: reserva._id,
            actividadId: actividad,
            fecha: fechaReserva,
            numeroPersonas,
            costoTotal
        });

        const payloadNuevaReserva = {
            tipo:      'nueva_reserva',
            titulo:    `📋 Nueva reserva — ${actividadExistente?.nombre || 'Actividad'}`,
            mensaje:   `Se realizó una nueva reserva para el ${new Date(fechaActividad).toLocaleDateString('es-BO')} (${numeroPersonas} persona${numeroPersonas > 1 ? 's' : ''}).`,
            prioridad: 'normal',
            datos:     { reservaId: reserva._id },
        };
        await Promise.all([
            crearNotificacionesAdmins(payloadNuevaReserva),
            crearNotificacionesOperadores(payloadNuevaReserva),
        ]);

        // Marcar la reserva como notificada
        await reserva.updateOne({ notificacionEnviada: true });

        // Devolver reserva con datos poblados
        const reservaCompleta = await Reserva.findById(reserva._id)
            .populate('usuario', 'nombre email ci celular')
            .populate('actividad', 'nombre descripcion ubicacion');

        res.status(201).json({ 
            msg: 'Reserva creada exitosamente',
            reserva: reservaCompleta 
        });

    } catch (error) {
        console.error('❌ Error al crear reserva:', error);
        res.status(500).json({ error: error.message });
    }
};

// Listar todas las reservas (SOLO ADMIN)
exports.listarReservas = async (req, res) => {
    try {
        const reservas = await Reserva.find()
            .populate('usuario', 'nombre email ci celular')
            .populate('actividad', 'nombre descripcion ubicacion')
            .sort({ fechaActividad: -1 });

        res.json(reservas);
    } catch (error) {
        console.error('❌ Error al listar reservas:', error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener reserva por id
exports.obtenerReserva = async (req, res) => {
    try {
        const reserva = await Reserva.findById(req.params.id)
            .populate('usuario', 'nombre email ci celular')
            .populate('actividad', 'nombre descripcion ubicacion');

        if (!reserva) {
            return res.status(404).json({ msg: 'Reserva no encontrada' });
        }

        // Verificar que el usuario solo pueda ver sus propias reservas (o sea admin)
        const esAdmin = req.user.roles.includes('admin');
        const esSuReserva = reserva.usuario._id.toString() === req.user._id.toString();

        if (!esAdmin && !esSuReserva) {
            return res.status(403).json({ msg: 'No tienes permiso para ver esta reserva' });
        }

        res.json(reserva);
    } catch (error) {
        console.error('❌ Error al obtener reserva:', error);
        res.status(500).json({ error: error.message });
    }
};

// Actualizar reserva
exports.actualizarReserva = async (req, res) => {
    try {
        const { tipoTour, fechaActividad, numeroPersonas, categoria, costoTotal, estado } = req.body;
        // Buscar reserva existente
        const reservaExistente = await Reserva.findById(req.params.id);
        if (!reservaExistente) {
            return res.status(404).json({ msg: 'Reserva no encontrada' });
        }

        // Verificar permisos
        const esAdmin = req.user.roles.includes('admin');
        const esSuReserva = reservaExistente.usuario.toString() === req.user._id.toString();

        if (!esAdmin && !esSuReserva) {
            return res.status(403).json({ msg: 'No tienes permiso para modificar esta reserva' });
        }

        // Construir objeto de actualización
        const esOperador = req.user.roles.includes('operador');
        const updateData = {};
        if (tipoTour) updateData.tipoTour = tipoTour;
        if (fechaActividad) updateData.fechaActividad = new Date(fechaActividad);
        if (numeroPersonas) updateData.numeroPersonas = numeroPersonas;
        if (categoria) updateData.categoria = categoria;
        if (costoTotal !== undefined) updateData.costoTotal = costoTotal;

        if (estado) {
            // Solo admin u operador pueden confirmar
            if (estado === 'Confirmada' && !esAdmin && !esOperador) {
                return res.status(403).json({ msg: 'Solo un administrador u operador puede confirmar una reserva.' });
            }
            // Turistas solo pueden cancelar, no cambiar a otros estados
            if (!esAdmin && !esOperador && estado !== 'Cancelada') {
                return res.status(403).json({ msg: 'No tienes permiso para cambiar el estado a ese valor.' });
            }
            updateData.estado = estado;
        }

        // Validar fecha si se está actualizando
        if (updateData.fechaActividad) {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (updateData.fechaActividad < hoy) {
                return res.status(400).json({ error: 'No se puede reservar una fecha pasada.' });
            }
        }

        // Validar capacidad si se cambia número de personas
        if (numeroPersonas && numeroPersonas !== reservaExistente.numeroPersonas) {
            const actividad = await Actividad.findById(reservaExistente.actividad);
            
            if (numeroPersonas > actividad.capacidadMaxima) {
                return res.status(400).json({ 
                    error: `El número máximo de personas es ${actividad.capacidadMaxima}.` 
                });
            }
        }

        // Actualizar reserva
        const reserva = await Reserva.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        )
        .populate('usuario', 'nombre email ci celular')
        .populate('actividad', 'nombre descripcion ubicacion');

        await registrarAccion(req.user._id, 'Actualizó reserva', {
            reservaId: reserva._id,
            cambios: Object.keys(updateData)
        });

        const payloadCambioReserva = {
            tipo:      'cambio_reserva',
            titulo:    `✏️ Reserva modificada`,
            mensaje:   `Una reserva ha sido actualizada. Estado: ${reserva.estado || 'actualizado'}.`,
            prioridad: 'normal',
            datos:     { reservaId: reserva._id },
        };
        await Promise.all([
            crearNotificacionesAdmins(payloadCambioReserva),
            crearNotificacionesOperadores(payloadCambioReserva),
        ]);

        res.json({
            msg: 'Reserva actualizada',
            reserva
        });

    } catch (error) {
        console.error('❌ Error al actualizar reserva:', error);
        res.status(400).json({ error: error.message });
    }
};

// Cancelar reserva (por el usuario)
exports.cancelarReserva = async (req, res) => {
    try {
        const reserva = await Reserva.findById(req.params.id);
        
        if (!reserva) {
            return res.status(404).json({ msg: 'Reserva no encontrada' });
        }

        // Verificar que sea su reserva
        if (reserva.usuario.toString() !== req.user._id.toString()) {
            return res.status(403).json({ msg: 'No puedes cancelar reservas de otros usuarios' });
        }

        // Verificar que no esté ya cancelada
        if (reserva.estado === 'Cancelada') {
            return res.status(400).json({ msg: 'Esta reserva ya está cancelada' });
        }

        reserva.estado = 'Cancelada';
        await reserva.save();

        await registrarAccion(req.user._id, 'Canceló reserva', { reservaId: reserva._id });

        const payloadCancelacion = {
            tipo:      'cancelacion_reserva',
            titulo:    `❌ Reserva cancelada`,
            mensaje:   `Una reserva ha sido cancelada.`,
            prioridad: 'normal',
            datos:     { reservaId: reserva._id },
        };
        await Promise.all([
            crearNotificacionesAdmins(payloadCancelacion),
            crearNotificacionesOperadores(payloadCancelacion),
        ]);

        res.json({
            msg: 'Reserva cancelada exitosamente',
            reserva
        });

    } catch (error) {
        console.error('❌ Error al cancelar reserva:', error);
        res.status(500).json({ error: error.message });
    }
};

// Eliminar reserva (SOLO ADMIN)
exports.eliminarReserva = async (req, res) => {
    try {
        const reserva = await Reserva.findByIdAndDelete(req.params.id);
        
        if (!reserva) {
            return res.status(404).json({ msg: 'Reserva no encontrada' });
        }

        await registrarAccion(req.user._id, 'Eliminó reserva', { reservaId: reserva._id });

        res.json({ msg: 'Reserva eliminada' });
    } catch (error) {
        console.error('❌ Error al eliminar reserva:', error);
        res.status(500).json({ error: error.message });
    }
};

// ── Deportes más reservados (público – sin autenticación) ──────────────────
exports.getDeportesDestacados = async (req, res) => {
    try {
        const resultado = await Reserva.aggregate([
            // Solo reservas no canceladas
            { $match: { estado: { $ne: 'Cancelada' } } },
            // Agrupar por actividad y contar
            { $group: { _id: '$actividad', totalReservas: { $sum: 1 } } },
            // Ordenar de mayor a menor
            { $sort: { totalReservas: -1 } },
            // Tomar las 4 primeras
            { $limit: 4 },
            // Join con colección de actividades para obtener el nombre
            {
                $lookup: {
                    from: 'actividads',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'actividadInfo'
                }
            },
            { $unwind: '$actividadInfo' },
            {
                $project: {
                    _id: 1,
                    nombre: '$actividadInfo.nombre',
                    totalReservas: 1
                }
            }
        ]);

        res.json({
            hayDatos: resultado.length > 0,
            deportes: resultado
        });
    } catch (error) {
        console.error('❌ Error al obtener deportes destacados:', error);
        res.status(500).json({ error: error.message });
    }
};

// Mostrar reservas del usuario autenticado
exports.misReservas = async (req, res) => {
    try {
        const usuarioId = req.user._id;

        const reservas = await Reserva.find({ usuario: usuarioId })
            .populate('actividad', 'nombre descripcion ubicacion')
            .sort({ fechaActividad: -1 });

        res.json(reservas);
    } catch (error) {
        console.error('❌ Error al obtener mis reservas:', error);
        res.status(500).json({ error: error.message });
    }
};