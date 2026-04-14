require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Actividad = require('../models/Actividad');

async function actualizarCoordenadas() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Actividades con coordenadas a actualizar
    const actualizaciones = [
      {
        nombre: 'Burble Soccer en La Paz (Murillo)',
        nuevasCoordenadas: [-68.11523847265123, -16.52134562378945]
      },
      {
        nombre: 'Paintball en La Paz (Murillo)',
        nuevasCoordenadas: [-68.12156734521987, -16.51876234509876]
      },
      {
        nombre: 'Paintball en Cochabamba (Cercado)',
        nuevasCoordenadas: [-66.15678345123456, -17.37892345678912]
      },
      {
        nombre: 'Paintball en Santa Cruz (Andrés Ibáñez)',
        nuevasCoordenadas: [-63.16234567891234, -17.76789123456789]
      },
      {
        nombre: 'Puenting en Cochabamba (Cercado)',
        nuevasCoordenadas: [-66.13234567812345, -17.42345678912345]
      },
      {
        nombre: 'Puenting en Santa Cruz (Florida)',
        nuevasCoordenadas: [-63.16789123456789, -17.76123456789123]
      }
    ];

    let actualizados = 0;
    let noEncontrados = 0;

    for (const { nombre, nuevasCoordenadas } of actualizaciones) {
      const resultado = await Actividad.updateOne(
        { nombre },
        {
          $set: {
            'ubicacion.coordinates': nuevasCoordenadas
          }
        }
      );

      if (resultado.matchedCount > 0) {
        console.log(`✅ ${nombre} → [${nuevasCoordenadas[0]}, ${nuevasCoordenadas[1]}]`);
        actualizados++;
      } else {
        console.warn(`⚠️  No encontrado: ${nombre}`);
        noEncontrados++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN:');
    console.log(`   • Total a actualizar: ${actualizaciones.length}`);
    console.log(`   • Actualizados: ${actualizados}`);
    console.log(`   • No encontrados: ${noEncontrados}`);
    console.log('='.repeat(60));
    console.log('\n🎯 Migración de coordenadas completada');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

actualizarCoordenadas();