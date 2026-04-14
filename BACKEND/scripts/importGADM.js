/**
 * Importación de límites GADM Bolivia → MongoDB
 *
 * Puede ejecutarse de dos formas:
 *   - Automática: se llama desde server.js al arrancar (solo si la colección está vacía)
 *   - Manual:     node scripts/importGADM.js
 *
 * Archivos esperados en  BACKEND/data/gadm/ :
 *   gadm41_BOL_0.json  (país)
 *   gadm41_BOL_1.json  (departamentos)
 *   gadm41_BOL_2.json  (provincias)
 *   gadm41_BOL_3.json  (municipios)
 */

const fs          = require('fs');
const path        = require('path');
const GeoBoundary = require('../models/GeoBoundary');

const CODIGO_KEY = ['GID_0', 'GID_1', 'GID_2', 'GID_3'];
const NOMBRE_KEY = { 0: 'COUNTRY', 1: 'NAME_1', 2: 'NAME_2', 3: 'NAME_3' };
const PADRE_KEY  = { 1: 'GID_0',   2: 'GID_1',  3: 'GID_2' };
const DATA_DIR   = path.join(__dirname, '..', 'data', 'gadm');

async function importarNivel(nivel) {
  const filepath = path.join(DATA_DIR, `gadm41_BOL_${nivel}.json`);

  if (!fs.existsSync(filepath)) {
    console.log(`   ⚠️  Nivel ${nivel}: archivo no encontrado (${filepath})`);
    return 0;
  }

  const geojson = JSON.parse(fs.readFileSync(filepath, 'utf8'));

  const docs = geojson.features
    .filter(f => f.geometry)
    .map(f => {
      const p = f.properties;
      return {
        nombre:      p[NOMBRE_KEY[nivel]] || 'Sin nombre',
        nivel,
        codigo:      p[CODIGO_KEY[nivel]]  ?? null,
        codigoPadre: nivel > 0 ? (p[PADRE_KEY[nivel]] ?? null) : null,
        geometria:   f.geometry,
        properties: {
          pais: p.COUNTRY,
          tipo: p[`ENGTYPE_${nivel}`] ?? null,
        },
      };
    });

  const BATCH = 50;
  for (let i = 0; i < docs.length; i += BATCH) {
    await GeoBoundary.insertMany(docs.slice(i, i + BATCH), { ordered: false });
  }

  return docs.length;
}

/**
 * Importa todos los niveles GADM Bolivia.
 * Si `soloSiVacio=true` (defecto), solo corre cuando la colección está vacía.
 */
async function initGADM(soloSiVacio = true) {
  if (soloSiVacio) {
    const existe = await GeoBoundary.countDocuments();
    if (existe > 0) {
      console.log('📍 GADM Bolivia ya cargado — omitiendo importación');
      return;
    }
  }

  // Verificar que haya al menos un archivo antes de intentar importar
  const hayArchivos = [0, 1, 2, 3].some(n =>
    fs.existsSync(path.join(DATA_DIR, `gadm41_BOL_${n}.json`))
  );

  if (!hayArchivos) {
    console.log('📍 GADM Bolivia: no se encontraron archivos en data/gadm/ — omitiendo');
    return;
  }

  console.log('📍 Importando límites GADM Bolivia...');
  let total = 0;
  for (const nivel of [0, 1, 2, 3]) {
    const n = await importarNivel(nivel);
    if (n > 0) console.log(`   ✅ Nivel ${nivel}: ${n} features`);
    total += n;
  }
  console.log(`📍 GADM Bolivia importado: ${total} features en total`);
}

module.exports = initGADM;

// ── Ejecución directa: node scripts/importGADM.js ──────────────────────────
if (require.main === module) {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  const connectDB  = require('../config/db');
  const mongoose   = require('mongoose');

  (async () => {
    await connectDB();
    await initGADM(false); // forzar importación aunque ya existan datos
    await mongoose.disconnect();
  })().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
}
