/**
 * Script rápido: asigna los permisos correctos al rol "operador"
 * Ejecutar: node scripts/fixOperadorPermisos.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Role       = require('../models/Role');
const Permission = require('../models/Permission');

const PERMISOS_OPERADOR = [
  'listar_actividades',
  'ver_actividad',
  'ver_reservas',           // participantes pre-salida
  'ver_itinerarios',        // itinerarios asignados
  'crear_reporte_actividad', // reporte post-actividad
  'ver_reportes_actividad',  // consultar reportes propios
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Conectado a MongoDB');

  // Buscar los ObjectIds de los permisos
  const permisosDocs = await Permission.find({ codename: { $in: PERMISOS_OPERADOR } }).select('_id codename');

  const encontrados = permisosDocs.map(p => p.codename);
  const faltantes   = PERMISOS_OPERADOR.filter(c => !encontrados.includes(c));

  if (faltantes.length > 0) {
    console.warn('⚠️  Permisos no encontrados en BD (¿corriste el script principal?):', faltantes.join(', '));
  }

  console.log('📋 Permisos encontrados:', encontrados.join(', '));

  // Actualizar el rol operador
  const resultado = await Role.findOneAndUpdate(
    { nombre: 'operador' },
    { $set: { permisos: permisosDocs.map(p => p._id) } },
    { new: true }
  );

  if (!resultado) {
    console.error('❌ Rol "operador" no encontrado en la BD');
    process.exit(1);
  }

  console.log('✅ Rol "operador" actualizado con', permisosDocs.length, 'permisos');
  process.exit(0);
}

main().catch(err => { console.error('❌ Error:', err); process.exit(1); });
