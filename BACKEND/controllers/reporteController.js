const Reserva = require('../models/Reserva');
const Actividad = require('../models/Actividad');
const Itinerario = require('../models/Itinerario');

exports.reporteReservasPorActividad = async (req, res) => {
    try {
        const data = await Reserva.aggregate([
            {
                $group: {
                    _id: "$actividad",
                    total: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "actividads",
                    localField: "_id",
                    foreignField: "_id",
                    as: "actividad"
                }
            },
            { $unwind: "$actividad" },
            {
                $project: {
                    nombreActividad: "$actividad.nombre",
                    total: 1
                }
            }
        ]);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.reporteEstadoRecursos = async (req, res) => {
    try {
        const data = await Itinerario.aggregate([
            {
                $group: {
                    _id: "$estado",
                    total: { $sum: 1 }
                }
            }
        ]);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};