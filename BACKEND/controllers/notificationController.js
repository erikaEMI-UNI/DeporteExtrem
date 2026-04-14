const Notification = require('../models/Notification');
const User         = require('../models/User');
const Role         = require('../models/Role');

// ── Helper genérico: crea notificaciones para usuarios de un rol ─────────────
async function crearNotificacionesPorRol(nombreRol, { tipo, titulo, mensaje, prioridad = 'normal', datos = {} }) {
  try {
    const rol = await Role.findOne({ nombre: nombreRol });
    if (!rol) return;

    const usuarios = await User.find({ roles: rol._id, activo: true }).select('_id');
    if (!usuarios.length) return;

    const docs = usuarios.map(u => ({
      destinatario: u._id,
      tipo,
      titulo,
      mensaje,
      prioridad,
      datos,
    }));

    await Notification.insertMany(docs);
  } catch (err) {
    console.error(`Error creando notificaciones para rol ${nombreRol}:`, err.message);
  }
}

// ── Helper: crea notificaciones para todos los admins ───────────────────────
async function crearNotificacionesAdmins(payload) {
  return crearNotificacionesPorRol('admin', payload);
}

// ── Helper: crea notificaciones para todos los operadores ───────────────────
async function crearNotificacionesOperadores(payload) {
  return crearNotificacionesPorRol('operador', payload);
}

// ── Listar notificaciones del usuario actual ─────────────────────────────────
exports.listar = async (req, res) => {
  try {
    const notifs = await Notification.find({ destinatario: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Contar no leídas ─────────────────────────────────────────────────────────
exports.contarNoLeidas = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      destinatario: req.user._id,
      leida: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Marcar una como leída ────────────────────────────────────────────────────
exports.marcarLeida = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, destinatario: req.user._id },
      { leida: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Marcar todas como leídas ─────────────────────────────────────────────────
exports.marcarTodasLeidas = async (req, res) => {
  try {
    await Notification.updateMany(
      { destinatario: req.user._id, leida: false },
      { leida: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.crearNotificacionesAdmins     = crearNotificacionesAdmins;
exports.crearNotificacionesOperadores = crearNotificacionesOperadores;
