const User = require('../models/User');
const { registrarAccion } = require('./historialController'); // Importa la función

exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find()
      .select('-password')
      .populate('roles'); // 👈 CLAVE

    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener usuarios' });
  }
};


exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'roles',
        populate: {
          path: 'permisos',
          select: 'codename nombre'
        }
      })
      .populate({
        path: 'permisos',
        select: 'codename nombre'
      });

    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener usuario' });
  }
};
exports.actualizarUsuario = async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const { nombre, email, ci, celular, roles, permisos, nuevaContrasena, esVip } = req.body;

        // Construir objeto de actualización
        const updateData = {};
        if (nombre !== undefined) updateData.nombre = nombre;
        if (email !== undefined) updateData.email = email;
        if (ci !== undefined) updateData.ci = ci;
        if (celular !== undefined) updateData.celular = celular;
        if (esVip !== undefined) updateData.esVip = esVip;

        // ✅ CONVERTIR ROLES (nombres) A ObjectIds
        if (roles !== undefined && Array.isArray(roles)) {
            const Role = require('../models/Role');
            const rolesEncontrados = await Role.find({ nombre: { $in: roles } }).select('_id');
            updateData.roles = rolesEncontrados.map(r => r._id);
        }

        // ✅ CONVERTIR PERMISOS CODENAMES A ObjectIds
        if (permisos !== undefined && Array.isArray(permisos)) {
            const Permiso = require('../models/Permission');
            const permisosEncontrados = await Permiso.find({ codename: { $in: permisos } }).select('_id');
            updateData.permisos = permisosEncontrados.map(p => p._id);
        }

        // ✅ CAMBIO DE CONTRASEÑA (hash manual — findByIdAndUpdate no dispara pre-save)
        if (nuevaContrasena && nuevaContrasena.trim().length >= 6) {
            updateData.password = await bcrypt.hash(nuevaContrasena.trim(), 10);
        }

        const usuario = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
        .select('-password')
        .populate('roles', 'nombre descripcion')
        .populate('permisos', 'codename nombre');

        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        await registrarAccion(req.user._id, 'Actualizó usuario', {
            usuarioId: usuario._id,
            cambios: Object.keys(updateData)
        });

        res.json({ msg: 'Usuario actualizado', usuario });
    } catch (err) {
        console.error('❌ Error al actualizar usuario:', err);

        if (err.name === 'ValidationError') {
            const errores = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ msg: 'Error de validación', errores });
        }

        res.status(500).json({ msg: 'Error al actualizar usuario', error: err.message });
    }
};

exports.eliminarUsuario = async (req, res) => {
    try {
        const usuario = await User.findByIdAndDelete(req.params.id);
        if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

        await registrarAccion(req.user._id, 'Eliminó usuario', { usuarioId: usuario._id });
        res.json({ msg: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ msg: 'Error al eliminar usuario' });
    }
};

exports.activarUsuario = async (req, res) => {
    try {
        const usuario = await User.findByIdAndUpdate(
            req.params.id,
            { activo: true },
            { new: true }
        ).select('-password');
        if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

        await registrarAccion(req.user._id, 'Activó usuario', { usuarioId: usuario._id });
        res.json({ msg: 'Usuario activado', usuario });
    } catch (err) {
        res.status(500).json({ msg: 'Error al activar usuario' });
    }
};

exports.desactivarUsuario = async (req, res) => {
    try {
        const usuario = await User.findByIdAndUpdate(
            req.params.id,
            { activo: false },
            { new: true }
        ).select('-password');
        if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

        await registrarAccion(req.user._id, 'Desactivó usuario', { usuarioId: usuario._id });
        res.json({ msg: 'Usuario desactivado', usuario });
    } catch (err) {
        res.status(500).json({ msg: 'Error al desactivar usuario' });
    }
};

exports.toggleVip = async (req, res) => {
    try {
        const usuario = await User.findById(req.params.id).select('-password');
        if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

        usuario.esVip = !usuario.esVip;
        await usuario.save();

        // Devolver con roles y permisos populados igual que los demás endpoints
        const usuarioPopulado = await User.findById(usuario._id)
            .select('-password')
            .populate('roles', 'nombre descripcion')
            .populate('permisos', 'codename nombre');

        await registrarAccion(req.user._id, `${usuario.esVip ? 'Marcó' : 'Quitó'} VIP al usuario`, { usuarioId: usuario._id });
        res.json({ msg: `Usuario ${usuarioPopulado.esVip ? 'marcado como VIP' : 'quitado de VIP'}`, usuario: usuarioPopulado });
    } catch (err) {
        res.status(500).json({ msg: 'Error al cambiar estado VIP' });
    }
};

// obtener datos del usuario logueado con permisos y roles
exports.obtenerDatosUsuario = async (req, res) => {
    try {
        console.log('👤 req.user:', req.user);  // Debug
        console.log('👤 req.userId:', req.userId);  // Debug
        
        // ✅ FIX: Usar req.user._id si existe, sino req.userId
        const userId = req.user?._id || req.userId;
        
        if (!userId) {
            return res.status(401).json({ msg: 'Usuario no autenticado' });
        }

        const usuario = await User.findById(userId)
            .select('-password -tokenRecuperacion -expiracionToken')
            .populate('roles', 'nombre descripcion')
            .populate('permisos', 'codename nombre');

        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        // ✅ verifyToken YA cargó los permisos del rol en req.user.permisos
        // Los combinamos con los permisos directos del usuario (sin duplicados)
        const permisosDelRol   = Array.isArray(req.user?.permisos) ? req.user.permisos : [];
        const permisosDirectos = usuario.permisos.map(p => p.codename);
        const todosPermisos    = [...new Set([...permisosDelRol, ...permisosDirectos])];

        // Formatear respuesta
        const userData = {
            id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            ci: usuario.ci,
            celular: usuario.celular,
            activo: usuario.activo,
            esVip: usuario.esVip || false,
            roles: usuario.roles.map(rol => rol.nombre),
            permisos: todosPermisos,   // ← directos + del rol
            ultimoLogin: usuario.ultimoLogin,
            createdAt: usuario.createdAt
        };

        console.log('👤 userData.permisos:', userData.permisos);  // Debug

        res.json(userData);
    } catch (err) {
        console.error('❌ Error en obtenerDatosUsuario:', err);
        res.status(500).json({ msg: 'Error al obtener datos del usuario' });
    }
};