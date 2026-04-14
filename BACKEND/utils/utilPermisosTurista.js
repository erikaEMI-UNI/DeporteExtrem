const Permission = require('../models/Permission');
const Role       = require('../models/Role');
const User       = require('../models/User');

const codenamesTurista = [
  'listar_actividades',
  'ver_actividad',
  'ver_mis_reservas',
  'crear_reservas',
  'ver_reserva_especifica',
  'editar_reservas',
  'eliminar_reservas',
  'crear_ficha_medica',
  'ver_ficha_medica',
  'editar_ficha_medica',
  'ver_itinerarios',
  'ver_multimedia',
  'ver_reservas',
];

/**
 * Asigna permisos al rol turista.
 * Crea el permiso con upsert si no existe en BD.
 */
async function initPermisosTurista() {
  try {
    console.log('🎫 Verificando permisos de turistas...');

    const rolTurista = await Role.findOne({ nombre: 'turista' });
    if (!rolTurista) {
      console.log('⚠️  Rol "turista" no encontrado, se creará en initAuth');
      return;
    }

    // Asegurar que cada permiso existe en la BD (upsert)
    const permisoIds = [];
    for (const codename of codenamesTurista) {
      const permiso = await Permission.findOneAndUpdate(
        { codename },
        {
          $setOnInsert: {
            nombre: codename.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            codename,
          },
        },
        { upsert: true, new: true }
      );
      permisoIds.push(permiso._id);
    }

    // Actualizar el rol si cambiaron los permisos
    const actualesStr  = (rolTurista.permisos || []).map(p => p.toString());
    const esperadosStr = permisoIds.map(p => p.toString());
    const sonIguales   =
      actualesStr.length === esperadosStr.length &&
      esperadosStr.every(id => actualesStr.includes(id));

    if (!sonIguales) {
      rolTurista.permisos = permisoIds;
      await rolTurista.save();
      console.log(`  ✅ Rol "turista" actualizado con ${permisoIds.length} permisos`);
    } else {
      console.log(`  ℹ️  Rol "turista" ya tiene todos sus permisos (${permisoIds.length})`);
    }

    // Propagar permisos a usuarios turistas individuales
    const turistas = await User.find({ roles: rolTurista._id });
    if (turistas.length === 0) {
      console.log('  ℹ️  No hay usuarios turistas todavía');
      return;
    }

    let actualizados = 0;
    for (const user of turistas) {
      const actualesUser   = (user.permisos || []).map(p => p.toString());
      const nuevos = permisoIds.filter(id => !actualesUser.includes(id.toString()));
      if (nuevos.length > 0) {
        user.permisos = [...user.permisos, ...nuevos];
        await user.save();
        actualizados++;
      }
    }

    if (actualizados > 0) {
      console.log(`  ✅ ${actualizados}/${turistas.length} turistas actualizados`);
    } else {
      console.log(`  ℹ️  Todos los turistas ya tienen sus permisos`);
    }

  } catch (error) {
    console.error('❌ Error al inicializar permisos de turistas:', error.message);
    throw error;
  }
}

module.exports = initPermisosTurista;
