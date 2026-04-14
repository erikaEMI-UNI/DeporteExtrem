const PasoItinerario = require('../models/PasoItinerario');
const Actividad      = require('../models/Actividad');

// GET /pasos-itinerario?actividad=:id
exports.listarPasos = async (req, res) => {
  try {
    const { actividad } = req.query;
    if (!actividad) return res.status(400).json({ error: 'Se requiere el parámetro actividad' });

    const pasos = await PasoItinerario.find({ actividad }).sort('order titulo');
    res.json(pasos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /pasos-itinerario
exports.crearPaso = async (req, res) => {
  try {
    const { actividad, titulo, descripcion, hora, duracion, tipo, ubicacion, order, notas } = req.body;

    if (!actividad) return res.status(400).json({ error: 'El campo actividad es requerido' });
    if (!titulo)    return res.status(400).json({ error: 'El campo titulo es requerido' });

    const act = await Actividad.findById(actividad);
    if (!act) return res.status(404).json({ error: 'Actividad no encontrada' });

    const paso = new PasoItinerario({
      actividad, titulo, descripcion, hora, duracion, tipo, ubicacion,
      order: Number(order) || 0,
      notas,
    });
    await paso.save();
    res.status(201).json(paso);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /pasos-itinerario/reordenar  — body: { items: [{_id, order}] }
// IMPORTANT: this route must be registered BEFORE /:id
exports.reordenarPasos = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items debe ser un array de { _id, order }' });
    }

    await Promise.all(
      items.map(({ _id, order }) =>
        PasoItinerario.findByIdAndUpdate(_id, { order: Number(order) || 0 })
      )
    );
    res.json({ mensaje: 'Orden actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /pasos-itinerario/:id
exports.actualizarPaso = async (req, res) => {
  try {
    const { titulo, descripcion, hora, duracion, tipo, ubicacion, order, notas } = req.body;

    const paso = await PasoItinerario.findByIdAndUpdate(
      req.params.id,
      { titulo, descripcion, hora, duracion, tipo, ubicacion, order: Number(order) || 0, notas },
      { new: true, runValidators: true }
    );
    if (!paso) return res.status(404).json({ error: 'Paso no encontrado' });
    res.json(paso);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /pasos-itinerario/:id
exports.eliminarPaso = async (req, res) => {
  try {
    const paso = await PasoItinerario.findByIdAndDelete(req.params.id);
    if (!paso) return res.status(404).json({ error: 'Paso no encontrado' });
    res.json({ mensaje: 'Paso eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
