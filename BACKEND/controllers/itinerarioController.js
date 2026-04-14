const Itinerario = require('../models/Itinerario');

exports.crearItinerario = async (req, res) => {
    try {
        const itinerario = new Itinerario(req.body);
        await itinerario.save();
        res.status(201).json(itinerario);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.listarItinerarios = async (req, res) => {
    try {
        const itinerarios = await Itinerario.find().populate('actividad');
        res.json(itinerarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.actualizarItinerario = async (req, res) => {
    try {
        const itinerario = await Itinerario.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!itinerario) return res.status(404).json({ error: 'Itinerario no encontrado' });
        res.json(itinerario);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.eliminarItinerario = async (req, res) => {
    try {
        const result = await Itinerario.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ error: 'Itinerario no encontrado' });
        res.json({ mensaje: 'Itinerario eliminado correctamente' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
