// Conexión MongoDB (puedes usar mongoose.connect o MongoClient)
require('dotenv').config({path: '../.env'});
// Paso 1: Crear colección intermedia usando Aggregation Pipeline
// Esto es más eficiente que MapReduce para muchas operaciones de conteo/agregación simples
async function crearColeccionTemporal() {
  await mongoose.connection.db.collection('reservas').aggregate([
    {
      $lookup: {
        from: 'actividades', // El nombre de la colección real de actividades (generalmente en plural)
        localField: 'actividad',
        foreignField: '_id',
        as: 'actividadInfo'
      }
    },
    { $unwind: '$actividadInfo' },
    {
      $project: {
        usuario: 1,
        actividad: 1,
        nivelRiesgo: '$actividadInfo.nivelRiesgo'
      }
    },
    { $out: 'reservas_por_riesgo' }
  ]).toArray(); // .toArray() es necesario para ejecutar el pipeline de agregación
}

// Paso 2: Ejecutar MapReduce
async function ejecutarMapReduce() {
  await mongoose.connection.db.collection('reservas_por_riesgo').mapReduce(
    function () { emit(this.nivelRiesgo, 1); }, // Función Map
    function (key, values) { return Array.sum(values); }, // Función Reduce
    {
      out: 'resumen_reservas_riesgo' // Colección de salida de MapReduce
    }
  );
}

// Función principal asíncrona
(async () => {
  try {
    // Asegúrate de que tu base de datos esté accesible y tenga datos de prueba.
    // Necesitas documentos en 'reservas' con un campo 'actividad' (referencia a ObjectId)
    // y documentos en 'actividades' con un campo '_id' y 'nivelRiesgo'.

    console.log('Iniciando proceso de MapReduce...');
    await crearColeccionTemporal(); // Crea la colección temporal con los niveles de riesgo
    console.log('Colección temporal "reservas_por_riesgo" creada.');

    await ejecutarMapReduce(); // Ejecuta MapReduce sobre la colección temporal
    console.log('MapReduce completado.');

    // Paso 3: Obtener y mostrar los resultados después de que MapReduce haya terminado
    const resultado = await mongoose.connection.db.collection('resumen_reservas_riesgo').find().toArray();
    console.log('\n--- Resultado del MapReduce ---');
    console.log(resultado);
    console.log('-------------------------------');

  } catch (error) {
    console.error('Ocurrió un error durante el proceso:', error);
  } finally {
    // Cierra la conexión a MongoDB al final
    mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada.');
  }
})();