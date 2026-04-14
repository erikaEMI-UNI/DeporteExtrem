const Permission = require('../models/Permission');
const Role       = require('../models/Role');

const codenamesOperador = [
  'listar_actividades',
  'ver_actividad',
  'ver_reservas',
  'ver_itinerarios',
  'crear_reporte_actividad',
  'ver_reportes_actividad',
];

async function initPermisosOperador() {
  try {
    console.log('🔧 Sincronizando permisos de operador...');

    const rolOperador = await Role.findOne({ nombre: 'operador' });
    if (!rolOperador) {
      console.log('⚠️  Rol "operador" no encontrado');
      return;
    }

    // Garantizar que cada permiso existe — crearlo si no está
    const permisoIds = [];
    for (const codename of codenamesOperador) {
      let permiso = await Permission.findOne({ codename });
      if (!permiso) {
        permiso = await Permission.create({
          nombre: codename.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          codename,
        });
        console.log(`  ➕ Permiso creado: ${codename}`);
      }
      permisoIds.push(permiso._id);
    }

    // Siempre sobreescribir — sin short-circuit
    rolOperador.permisos = permisoIds;
    await rolOperador.save();
    console.log(`  ✅ Rol "operador" → ${permisoIds.length} permisos asignados: ${codenamesOperador.join(', ')}`);

  } catch (error) {
    console.error('❌ Error initPermisosOperador:', error.message);
    throw error;
  }
}

module.exports = initPermisosOperador;
