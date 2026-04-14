// scripts/asignarPermisosTurista.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Permiso = require('../models/Permission');

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
  'ver_multimedia'
];

async function asignarPermisosTurista() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tu_base_datos');
    
    // Obtener IDs de los permisos
    const permisos = await Permiso.find({
      codename: { $in: codenamesTurista }
    }).select('_id');
    
    const permisoIds = permisos.map(p => p._id);
    
    console.log(`📋 Permisos a asignar: ${permisoIds.length}`);
    
    // Actualizar todos los usuarios con rol "turista"
    const result = await User.updateMany(
      { roles: 'turista' },
      { $set: { permisos: permisoIds } }
    );
    
    console.log(`✅ Permisos asignados a ${result.modifiedCount} turistas`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

asignarPermisosTurista();