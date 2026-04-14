const Actividad = require('../models/Actividad');
const actividadesData = require('../data/dataActividades');

/**
 * Inicializa la base de datos con actividades si está vacía
 * @returns {Promise<void>}
 */
async function initActividades() {
  try {
    // Verificar si ya existen actividades
    const count = await Actividad.countDocuments();
    
    if (count > 0) {
      console.log(`ℹ️  Ya existen ${count} actividades en la base de datos`);
      return;
    }

    console.log('🔄 Inicializando actividades...');

    // Insertar todas las actividades
    const resultado = await Actividad.insertMany(actividadesData);
    
    console.log(`✅ ${resultado.length} actividades insertadas correctamente`);
    
    // Mostrar resumen
    const porNivel = await Actividad.aggregate([
      { $group: { _id: '$nivelRiesgo', total: { $sum: 1 } } }
    ]);
    
    console.log('📊 Resumen por nivel de riesgo:');
    porNivel.forEach(nivel => {
      console.log(`   - ${nivel._id}: ${nivel.total}`);
    });

  } catch (error) {
    console.error('❌ Error al inicializar actividades:', error.message);
    throw error;
  }
}

module.exports = initActividades;