/**
 * initCategorias.js
 * Se ejecuta automáticamente al iniciar el servidor.
 * Lee fichaTecnica.categoria de todas las actividades,
 * crea documentos en "categorias" y vincula cada actividad.
 * Es idempotente: no duplica categorías ni vínculos.
 */

const Categoria = require('../models/Categoria');
const Actividad = require('../models/Actividad');

const ICONOS = {
  'Rafting':             '🚣',
  'Senderismo':          '🥾',
  'Rappel':              '🧗',
  'Escalada':            '⛰️',
  'Parapente':           '🪂',
  'Montañismo':          '🏔️',
  'Ciclismo de montaña': '🚵',
  'Kayak':               '🛶',
  'Kayoning':            '🌊',
  'Trekking':            '🥾',
  'Canopy':              '🌿',
  'Espeleología':        '🕳️',
  'Sandboarding':        '🏂',
  'Tirolesa':            '🤸',
  'Buceo':               '🤿',
  'Paintball':           '🎯',
  'Puenting':            '🌉',
  'Salto Tándem':        '🪂',
  'Burble Soccer':       '⚽',
};

const initCategorias = async () => {
  try {
    const actividades = await Actividad.find({});
    if (actividades.length === 0) {
      console.log('ℹ️  initCategorias: sin actividades, omitiendo.');
      return;
    }

    // Recopilar nombres únicos desde fichaTecnica.categoria
    const nombresUnicos = new Set();
    for (const act of actividades) {
      const cat = act.fichaTecnica?.categoria?.trim();
      if (cat) nombresUnicos.add(cat);
    }

    if (nombresUnicos.size === 0) {
      console.log('ℹ️  initCategorias: ninguna actividad tiene fichaTecnica.categoria.');
      return;
    }

    // Crear categorías que no existan
    const mapa = {};
    for (const nombre of nombresUnicos) {
      let cat = await Categoria.findOne({ nombre });
      if (!cat) {
        cat = await Categoria.create({
          nombre,
          icono: ICONOS[nombre] || '🏔️',
        });
        console.log(`  ➕ Categoría creada: ${nombre}`);
      }
      mapa[nombre] = cat._id;
    }

    // Vincular actividades a sus categorías (sin duplicar)
    let vinculadas = 0;
    for (const act of actividades) {
      const nombre = act.fichaTecnica?.categoria?.trim();
      if (nombre && mapa[nombre]) {
        const yaVinculada = act.categorias.some(
          id => id.toString() === mapa[nombre].toString()
        );
        if (!yaVinculada) {
          act.categorias.push(mapa[nombre]);
          await act.save();
          vinculadas++;
        }
      }
    }

    console.log(`✅ initCategorias: ${nombresUnicos.size} categorías, ${vinculadas} actividades vinculadas.`);
  } catch (err) {
    console.error('❌ initCategorias error:', err.message);
  }
};

module.exports = initCategorias;
