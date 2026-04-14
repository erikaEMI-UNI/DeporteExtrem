const Actividad = require('../models/Actividad');
const { registrarAccion } = require('./historialController');

/**gestión de fechas disponibles para cada actividad.
 Manejo de capacidad automática
precios dinámicos

Estados de disponibilidad:
cerrar fechas
cancelar actividades
bloquear reservas
 */

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

// Crear nueva actividad (solo info básica)
exports.crearActividad = async (req, res) => {
    try {
        const { nombre, descripcion, recomendaciones, multimedia, ubicacion, categorias, descuento, enDescuento, tieneVip, precioVip } = req.body;

        // Verificar si ya existe
        const existe = await Actividad.findOne({ nombre });
        if (existe) {
            return res.status(400).json({ error: 'Ya existe una actividad con ese nombre.' });
        }

        // Validar ubicación
        if (!ubicacion || !ubicacion.zona || !ubicacion.coordinates) {
            return res.status(400).json({ error: 'La ubicación (zona y coordenadas) es requerida.' });
        }

        // Crear actividad con estado inactivo por defecto
        const actividad = new Actividad({
            nombre,
            descripcion,
            recomendaciones: recomendaciones || '',
            multimedia: multimedia || {
                imagenes: [], videos: [], panoramicas: [], videos360: [], audio: [], enlacesInternos: []
            },
            ubicacion,
            categorias: Array.isArray(categorias) ? categorias : [],
            activo: false,
            descuento:   descuento   !== undefined ? Math.min(100, Math.max(0, parseFloat(descuento) || 0)) : 0,
            enDescuento: enDescuento === true || enDescuento === 'true',
            tieneVip:    tieneVip    === true || tieneVip    === 'true',
            precioVip:   tieneVip    ? Math.max(0, parseFloat(precioVip) || 0) : 0,
            fechas: []
        });

        await actividad.save();
        await registrarAccion(req.user._id, `Creó la actividad "${actividad.nombre}"`);

        res.status(201).json(actividad);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Obtener todas las actividades
// Incluye campos resumen calculados desde fechas activas:
//   precioDesde     → precio mínimo entre todos los riesgos de fechas activas
//   nivelRiesgo     → nivel más alto presente en fechas activas
//   capacidadMaxima → mayor capacidadDisponible entre fechas activas
exports.listarActividades = async (req, res) => {
    try {
        // Admin/operador ven todo; todos los demás ven activas + inactivas con VIP habilitado
        const esAdmin = req.user?.roles?.some(r => ['admin', 'operador'].includes(r));
        const filtro  = esAdmin ? {} : { $or: [{ activo: true }, { activo: false, tieneVip: true }] };

        const actividades = await Actividad.find(filtro).populate('categorias', 'nombre icono modelos3d');

        const result = actividades.map(act => {
            const obj = act.toObject();

            const fechasActivas = (obj.fechas || []).filter(f => f.estado === 'activa');

            // Todos los riesgos de fechas activas
            const todosRiesgos = fechasActivas.flatMap(f => f.riesgos || []);

            // Precio mínimo
            const precios = todosRiesgos.map(r => r.precio).filter(p => typeof p === 'number' && p > 0);
            obj.precioDesde = precios.length > 0 ? Math.min(...precios) : 0;

            // Nivel de riesgo más alto presente
            const niveles = todosRiesgos.map(r => r.nivel);
            obj.nivelRiesgo = niveles.includes('Alto')  ? 'Alto'  :
                              niveles.includes('Medio') ? 'Medio' :
                              niveles.includes('Bajo')  ? 'Bajo'  : 'Medio';

            // Capacidad máxima disponible
            const caps = fechasActivas.map(f => f.capacidadDisponible || 0);
            obj.capacidadMaxima = caps.length > 0 ? Math.max(...caps) : 10;

            // Garantizar campos de descuento y VIP (documentos anteriores pueden no tenerlos)
            obj.descuento   = obj.descuento   ?? 0;
            obj.enDescuento = obj.enDescuento ?? false;
            obj.tieneVip    = obj.tieneVip    ?? false;
            obj.precioVip   = obj.precioVip   ?? 0;

            // Eliminar el array de fechas para no enviar todo el detalle
            delete obj.fechas;

            return obj;
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener una actividad por ID (con todas sus fechas)
exports.obtenerActividad = async (req, res) => {
    try {
        const actividad = await Actividad.findById(req.params.id).populate('categorias', 'nombre icono modelos3d');
        if (!actividad) return res.status(404).json({ mensaje: 'Actividad no encontrada' });
        res.json(actividad);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Reconstruye un array de multimedia, aceptando strings, objetos válidos y objetos corruptos (char-indexed)
const sanitizarMultimediaArr = (arr) =>
    (arr || []).map(item => {
        if (!item) return null;
        // String plano
        if (typeof item === 'string' && item.trim()) return { url: item.trim(), title: '', description: '', order: 0, is_360: false };
        // Objeto válido con url
        if (item.url) return item;
        // Objeto corrupto con keys numéricas (spread de string)
        const url = Object.entries(item)
            .filter(([k]) => /^\d+$/.test(k))
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([, v]) => v).join('');
        if (!url) return null;
        return { url, title: item.title || '', description: item.description || '', order: item.order || 0, is_360: !!item.is_360 };
    }).filter(Boolean);

// Actualizar una actividad (info básica)
exports.actualizarActividad = async (req, res) => {
    try {
        const { nombre, descripcion, recomendaciones, multimedia, ubicacion, activo, categorias, descuento, enDescuento, tieneVip, precioVip } = req.body;
        const actividad = await Actividad.findById(req.params.id);
        if (!actividad) return res.status(404).json({ mensaje: 'Actividad no encontrada' });

        // Si se está activando, verificar que tenga fechas
        if (activo === true && !actividad.activo) {
            if (!actividad.fechas || actividad.fechas.length === 0) {
                return res.status(400).json({ 
                    error: 'No se puede activar la actividad porque no tiene fechas configuradas' 
                });
            }
        }

        // Actualizar solo campos permitidos
        if (nombre) actividad.nombre = nombre;
        if (descripcion) actividad.descripcion = descripcion;
        if (recomendaciones !== undefined) actividad.recomendaciones = recomendaciones;
        if (multimedia) {
            actividad.multimedia = {
                imagenes:        sanitizarMultimediaArr(multimedia.imagenes),
                videos:          sanitizarMultimediaArr(multimedia.videos),
                panoramicas:     sanitizarMultimediaArr(multimedia.panoramicas),
                videos360:       sanitizarMultimediaArr(multimedia.videos360),
                audio:           sanitizarMultimediaArr(multimedia.audio),
                enlacesInternos: sanitizarMultimediaArr(multimedia.enlacesInternos),
            };
        }
        if (ubicacion) actividad.ubicacion = ubicacion;
        if (activo !== undefined) actividad.activo = activo;
        if (Array.isArray(categorias)) actividad.categorias = categorias;
        if (descuento   !== undefined) actividad.descuento   = Math.min(100, Math.max(0, parseFloat(descuento) || 0));
        if (enDescuento !== undefined) actividad.enDescuento = enDescuento === true || enDescuento === 'true';
        if (tieneVip    !== undefined) actividad.tieneVip    = tieneVip    === true || tieneVip    === 'true';
        if (precioVip   !== undefined) actividad.precioVip   = actividad.tieneVip ? Math.max(0, parseFloat(precioVip) || 0) : 0;

        await actividad.save();
        await registrarAccion(req.user._id, `Actualizó la actividad "${actividad.nombre}"`);

        res.json(actividad);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Ya existe una actividad con ese nombre.' });
        }
        res.status(400).json({ error: err.message });
    }
};

// Actualizar la ficha técnica de una actividad
exports.actualizarFichaTecnica = async (req, res) => {
    try {
        const {
            duracion, dificultad, altitud, clima,
            equipoNecesario, edadMinima, requisitosFisicos,
            categoria, temporada, incluye, noIncluye, puntoEncuentro,
            tiposActividad,
        } = req.body;

        const actividad = await Actividad.findById(req.params.id);
        if (!actividad) return res.status(404).json({ mensaje: 'Actividad no encontrada' });

        // Validaciones básicas
        if (edadMinima !== undefined && edadMinima !== null && edadMinima !== '') {
            const edad = Number(edadMinima);
            if (isNaN(edad) || edad < 0 || edad > 100) {
                return res.status(400).json({ error: 'La edad mínima debe ser un número entre 0 y 100' });
            }
        }

        if (!actividad.fichaTecnica) actividad.fichaTecnica = {};

        if (duracion           !== undefined) actividad.fichaTecnica.duracion           = duracion;
        if (dificultad         !== undefined) actividad.fichaTecnica.dificultad         = dificultad;
        if (altitud            !== undefined) actividad.fichaTecnica.altitud            = altitud;
        if (clima              !== undefined) actividad.fichaTecnica.clima              = clima;
        if (requisitosFisicos  !== undefined) actividad.fichaTecnica.requisitosFisicos  = requisitosFisicos;
        if (categoria          !== undefined) actividad.fichaTecnica.categoria          = categoria;
        if (temporada          !== undefined) actividad.fichaTecnica.temporada          = temporada;
        if (puntoEncuentro     !== undefined) actividad.fichaTecnica.puntoEncuentro     = puntoEncuentro;
        if (edadMinima !== undefined && edadMinima !== '') {
            actividad.fichaTecnica.edadMinima = edadMinima === null ? null : Number(edadMinima);
        }
        if (Array.isArray(equipoNecesario)) actividad.fichaTecnica.equipoNecesario = equipoNecesario;
        if (Array.isArray(incluye))         actividad.fichaTecnica.incluye         = incluye;
        if (Array.isArray(noIncluye))       actividad.fichaTecnica.noIncluye       = noIncluye;
        if (Array.isArray(tiposActividad))  actividad.fichaTecnica.tiposActividad  = tiposActividad;

        actividad.markModified('fichaTecnica');
        await actividad.save();
        await registrarAccion(req.user._id, `Actualizó la ficha técnica de "${actividad.nombre}"`);

        res.json(actividad.fichaTecnica);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Eliminar una actividad
exports.eliminarActividad = async (req, res) => {
    try {
        const actividad = await Actividad.findByIdAndDelete(req.params.id);
        if (!actividad) return res.status(404).json({ mensaje: 'Actividad no encontrada' });

        await registrarAccion(req.user._id, `Eliminó la actividad "${actividad.nombre}"`);

        res.json({ mensaje: 'Actividad eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ===== GESTIÓN DE FECHAS =====

// Agregar fecha a una actividad
exports.agregarFecha = async (req, res) => {
    try {
        const { id } = req.params;
        const { fechaInicio, fechaFin, capacidadDisponible, riesgos, estado } = req.body;

        const actividad = await Actividad.findById(id);
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

        res.status(201).json(actividad);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Fechas activas públicas de una actividad (para turistas — sin auth)
// Devuelve: fechaInicio, fechaFin, duracion, capacidadDisponible, riesgos[], estado
exports.obtenerFechasPublicas = async (req, res) => {
    try {
        const { id } = req.params;
        const actividad = await Actividad.findById(id).select('fechas nombre');
        if (!actividad) return res.status(404).json({ error: 'Actividad no encontrada' });

        const hoy = new Date();
        const fechasActivas = actividad.fechas
            .filter(f => f.estado === 'activa' && new Date(f.fechaFin) >= hoy)
            .sort((a, b) => a.fechaInicio - b.fechaInicio)
            .map(f => ({
                _id:                 f._id,
                fechaInicio:         f.fechaInicio,
                fechaFin:            f.fechaFin,
                duracion:            f.duracion,
                capacidadDisponible: f.capacidadDisponible,
                riesgos:             f.riesgos,   // [{ nivel, precio }]
                estado:              f.estado,
            }));

        res.json(fechasActivas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener todas las fechas de una actividad
exports.obtenerFechas = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.query;

        const actividad = await Actividad.findById(id).select('fechas');
        if (!actividad) {
            return res.status(404).json({ mensaje: 'Actividad no encontrada' });
        }

        let fechas = actividad.fechas;

        // Filtrar por estado si se especifica
        if (estado) {
            fechas = fechas.filter(f => f.estado === estado);
        }

        // Ordenar por fecha de inicio
        fechas.sort((a, b) => a.fechaInicio - b.fechaInicio);

        res.json(fechas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar una fecha específica
exports.actualizarFecha = async (req, res) => {
    try {
        const { id, fechaId } = req.params;
        const { fechaInicio, fechaFin, capacidadDisponible, riesgos, estado } = req.body;

        const actividad = await Actividad.findById(id);
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
        
        if (capacidadDisponible) {
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
        res.status(400).json({ error: err.message });
    }
};

// Eliminar una fecha específica
exports.eliminarFecha = async (req, res) => {
    try {
        const { id, fechaId } = req.params;

        const actividad = await Actividad.findById(id);
        if (!actividad) {
            return res.status(404).json({ mensaje: 'Actividad no encontrada' });
        }

        actividad.fechas = actividad.fechas.filter(f => f._id.toString() !== fechaId);
        await actividad.save();

        await registrarAccion(req.user._id, `Eliminó fecha de "${actividad.nombre}"`);

        res.json({ mensaje: 'Fecha eliminada correctamente' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Verificar disponibilidad de una fecha específica
exports.verificarDisponibilidadFecha = async (req, res) => {
    try {
        const { id, fechaId } = req.params;

        const actividad = await Actividad.findById(id);
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
        res.status(500).json({ error: err.message });
    }
};