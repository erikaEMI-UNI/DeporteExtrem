require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Actividad = require('../models/Actividad');

async function exportar() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener todas las actividades CON multimedia
    const actividades = await Actividad.find({}, {
      _id: 0,           // ✅ Excluir
      __v: 0,           // ✅ Excluir
      createdAt: 0,     // ✅ Excluir
      updatedAt: 0,     // ✅ Excluir
      activo: 0,        // ✅ Excluir
      capacidad: 0      // ✅ Excluir (campo antiguo si existe)
      // multimedia: 0  // ❌ QUITAR ESTA LÍNEA - Lo necesitamos
    }).lean();

    console.log(`📊 Actividades encontradas: ${actividades.length}`);

    // Verificar si hay multimedia
    const conMultimedia = actividades.filter(a => 
      a.multimedia && 
      (a.multimedia.imagenes?.length > 0 || 
       a.multimedia.videos?.length > 0 || 
       a.multimedia.videos360?.length > 0)
    ).length;
    
    console.log(`🎬 Actividades con multimedia: ${conMultimedia}`);

    // Generar contenido del archivo
    const contenido = `module.exports = ${JSON.stringify(actividades, null, 2)};`;

    // Guardar en data/dataActividades.js
    const rutaDestino = path.join(__dirname, '../data/dataActividades.js');
    fs.writeFileSync(rutaDestino, contenido, 'utf-8');

    console.log(`✅ Archivo generado: ${rutaDestino}`);
    console.log('\n📋 Actividades exportadas:');
    
    actividades.forEach((act, i) => {
      const hasMultimedia = act.multimedia && (
        act.multimedia.imagenes?.length > 0 || 
        act.multimedia.videos?.length > 0 ||
        act.multimedia.videos360?.length > 0
      );
      
      const icon = hasMultimedia ? '🎬' : '📄';
      console.log(`   ${i + 1}. ${icon} ${act.nombre}`);
      
      if (hasMultimedia) {
        if (act.multimedia.imagenes?.length) {
          console.log(`      └─ 🖼️  ${act.multimedia.imagenes.length} imagen(es)`);
        }
        if (act.multimedia.videos?.length) {
          console.log(`      └─ 🎥 ${act.multimedia.videos.length} video(s)`);
        }
        if (act.multimedia.videos360?.length) {
          console.log(`      └─ 🔄 ${act.multimedia.videos360.length} video(s) 360°`);
        }
      }
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

exportar();