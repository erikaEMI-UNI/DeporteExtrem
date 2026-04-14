/**
 * Script: seedCategorias.js
 * Lee el campo fichaTecnica.categoria de todas las actividades,
 * crea documentos en la colección "categorias" y vincula cada
 * actividad con su categoría correspondiente.
 *
 * Uso: node BACKEND/scripts/seedCategorias.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose  = require('mongoose');
const Categoria = require('../models/Categoria');
const Actividad = require('../models/Actividad');

// Mapeo de categorías a emojis
const ICONOS = {
  'Rafting':              '🚣',
  'Senderismo':           '🥾',
  'Rappel':               '🧗',
  'Escalada':             '⛰️',
  'Parapente':            '🪂',
  'Montañismo':           '🏔️',
  'Ciclismo de montaña':  '🚵',
  'Kayak':                '🛶',
  'Trekking':             '🥾',
  'Canopy':               '🌿',
  'Espeleología':         '🕳️',
  'Sandboarding':         '🏂',
  'Tirolesa':             '🤸',
  'Buceo':                '🤿',
  'Paintball':            '🎯',
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Conectado a', process.env.MONGODB_URI);

  const actividades = await Actividad.find({});
  console.log(`📋 ${actividades.length} actividades encontradas`);

  // Recopilar categorías únicas desde fichaTecnica.categoria
  const nombresUnicos = new Set();
  for (const act of actividades) {
    const cat = act.fichaTecnica?.categoria?.trim();
    if (cat) nombresUnicos.add(cat);
  }

  console.log(`🏷️  Categorías únicas encontradas: ${[...nombresUnicos].join(', ') || 'ninguna'}`);

  // Crear categorías que no existan
  const mapa = {}; // nombre → _id
  for (const nombre of nombresUnicos) {
    let cat = await Categoria.findOne({ nombre });
    if (!cat) {
      cat = await Categoria.create({
        nombre,
        icono: ICONOS[nombre] || '🏔️',
      });
      console.log(`  ➕ Categoría creada: ${nombre}`);
    } else {
      console.log(`  ℹ️  Ya existe: ${nombre}`);
    }
    mapa[nombre] = cat._id;
  }

  // Vincular actividades a sus categorías
  let vinculadas = 0;
  for (const act of actividades) {
    const cat = act.fichaTecnica?.categoria?.trim();
    if (cat && mapa[cat]) {
      // Solo agregar si no está ya vinculada
      const yaVinculada = act.categorias.some(id => id.toString() === mapa[cat].toString());
      if (!yaVinculada) {
        act.categorias.push(mapa[cat]);
        await act.save();
        vinculadas++;
        console.log(`  🔗 ${act.nombre} → ${cat}`);
      }
    }
  }

  console.log(`\n✅ Listo. ${nombresUnicos.size} categorías procesadas, ${vinculadas} actividades vinculadas.`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
