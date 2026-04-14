require('dotenv').config({path: '../.env'});
const mongoose = require('mongoose');
const Actividad = require('../models/Actividad');

const actividades = [
  {
    nombre: 'Rafting en La Paz (Nor Yungas)',
    descripcion: 'Descenso en ríos de aguas bravas en La Paz. No apto para embarazadas, personas con problemas cardíacos o movilidad reducida. Grupos de 6 a 8 personas.',
    nivelRiesgo: 'Alto',
    recomendaciones: 'Usar casco, chaleco salvavidas, traje y botas de neopreno. Ropa ajustada deportiva.',
    ubicacion: { type: 'Point', coordinates: [-68.09592859313416, -16.45451415706411] },
    precio: 450,
    duracion: 'Día completo',
    capacidadMaxima: 8
  },
  {
    nombre: 'Rafting en Cochabamba (Chapare)',
    descripcion: 'Descenso en ríos de aguas bravas en Cochabamba. No apto para embarazadas, personas con problemas cardíacos o movilidad reducida. Grupos de 6 a 8 personas.',
    nivelRiesgo: 'Alto',
    recomendaciones: 'Usar casco, chaleco salvavidas, traje y botas de neopreno. Ropa ajustada deportiva.',
    ubicacion: { type: 'Point', coordinates: [-66.1155604057882, -17.394720376840134] },
    precio: 420,
    duracion: 'Día completo',
    capacidadMaxima: 8
  },
  {
    nombre: 'Rappel en La Paz (Murillo)',
    descripcion: 'Descenso vertical con cuerdas en los cerros de La Paz. Contraindicado para personas con vértigo o lesiones en espalda/piernas.',
    nivelRiesgo: 'Medio',
    recomendaciones: 'Usar arnés, casco, cuerda dinámica, ropa cómoda y ajustada.',
    ubicacion: { type: 'Point', coordinates: [-68.13679932810294, -16.53010047476593] },
    precio: 280,
    duracion: 'Medio día',
    capacidadMaxima: 10
  },
  {
    nombre: 'Rappel en Cochabamba (Quillacollo)',
    descripcion: 'Descenso vertical con cuerdas en los cerros de Cochabamba. Contraindicado para personas con vértigo o lesiones en espalda/piernas.',
    nivelRiesgo: 'Medio',
    recomendaciones: 'Usar arnés, casco, cuerda dinámica, ropa cómoda y ajustada.',
    ubicacion: { type: 'Point', coordinates: [-66.17014082094005, -17.36186366958597] },
    precio: 260,
    duracion: 'Medio día',
    capacidadMaxima: 10
  },
  {
    nombre: 'Rappel en Santa Cruz (Florida)',
    descripcion: 'Descenso vertical con cuerdas en los cerros de Santa Cruz. Contraindicado para personas con vértigo o lesiones en espalda/piernas.',
    nivelRiesgo: 'Medio',
    recomendaciones: 'Usar arnés, casco, cuerda dinámica, ropa cómoda y ajustada.',
    ubicacion: { type: 'Point', coordinates: [-63.14343186654327, -17.813614248265424] },
    precio: 240,
    duracion: 'Medio día',
    capacidadMaxima: 10
  },
  {
    nombre: 'Parapente en La Paz (Nor Yungas)',
    descripcion: 'Vuelo sin motor desde las colinas de La Paz. Contraindicado para personas con asma o problemas cardíacos.',
    nivelRiesgo: 'Alto',
    recomendaciones: 'Usar arnés, casco, evitar objetos duros, ropa cómoda.',
    ubicacion: { type: 'Point', coordinates: [-68.14906119114471, -16.4702801158252] },
    precio: 550,
    duracion: '2-3 horas',
    capacidadMaxima: 2
  },
  {
    nombre: 'Parapente en Cochabamba (Cercado)',
    descripcion: 'Vuelo sin motor desde las colinas de Cochabamba. Contraindicado para personas con asma o problemas cardíacos.',
    nivelRiesgo: 'Alto',
    recomendaciones: 'Usar arnés, casco, evitar objetos duros, ropa cómoda.',
    ubicacion: { type: 'Point', coordinates: [-66.13771695177716, -17.36795866103791] },
    precio: 520,
    duracion: '2-3 horas',
    capacidadMaxima: 2
  },
  {
    nombre: 'Parapente en Santa Cruz (Florida)',
    descripcion: 'Vuelo sin motor desde las colinas de Santa Cruz. Contraindicado para personas con asma o problemas cardíacos.',
    nivelRiesgo: 'Alto',
    recomendaciones: 'Usar arnés, casco, evitar objetos duros, ropa cómoda.',
    ubicacion: { type: 'Point', coordinates: [-63.13896205653598, -17.755212584619226] },
    precio: 500,
    duracion: '2-3 horas',
    capacidadMaxima: 2
  },
  {
    nombre: 'Salto Tándem en La Paz (Nor Yungas)',
    descripcion: 'Salto en paracaídas con instructor en La Paz. No apto para personas con enfermedades cardíacas o columna.',
    nivelRiesgo: 'Alto',
    recomendaciones: 'Zapatos con tillas, ropa deportiva y cortaviento.',
    ubicacion: { type: 'Point', coordinates: [-68.10424499299809, -16.47045803530128] },
    precio: 1200,
    duracion: 'Medio día',
    capacidadMaxima: 1
  },
  {
    nombre: 'Salto Tándem en Cochabamba (Cercado)',
    descripcion: 'Salto en paracaídas con instructor en Cochabamba. No apto para personas con enfermedades cardíacas o columna.',
    nivelRiesgo: 'Alto',
    recomendaciones: 'Zapatos con tillas, ropa deportiva y cortaviento.',
    ubicacion: { type: 'Point', coordinates: [-66.14065864980006, -17.41570718053793] },
    precio: 1150,
    duracion: 'Medio día',
    capacidadMaxima: 1
  },
  {
    nombre: 'Salto Tándem en Santa Cruz (Florida)',
    descripcion: 'Salto en paracaídas con instructor en Santa Cruz. No apto para personas con enfermedades cardíacas o columna.',
    nivelRiesgo: 'Alto',
    recomendaciones: 'Zapatos con tillas, ropa deportiva y cortaviento.',
    ubicacion: { type: 'Point', coordinates: [-63.1444, -17.7750] },
    precio: 1100,
    duracion: 'Medio día',
    capacidadMaxima: 1
  },
  {
    nombre: 'Trekking en La Paz (Nor Yungas)',
    descripcion: 'Caminata en las montañas de La Paz. Evitar si se tienen enfermedades musculares o cardíacas.',
    nivelRiesgo: 'Medio',
    recomendaciones: 'Ropa cómoda, evitar joyas o gafas duras.',
    ubicacion: { type: 'Point', coordinates: [-68.0972, -16.3017] },
    precio: 180,
    duracion: 'Día completo',
    capacidadMaxima: 15
  },
  {
    nombre: 'Trekking en Cochabamba (Chapare)',
    descripcion: 'Caminata en las montañas de Cochabamba. Evitar si se tienen enfermedades musculares o cardíacas.',
    nivelRiesgo: 'Medio',
    recomendaciones: 'Ropa cómoda, evitar joyas o gafas duras.',
    ubicacion: { type: 'Point', coordinates: [-66.17183274949035, -17.352100796561196] },
    precio: 160,
    duracion: 'Día completo',
    capacidadMaxima: 15
  },
  {
    nombre: 'Trekking en Santa Cruz (Florida)',
    descripcion: 'Caminata en las montañas de Santa Cruz. Evitar si se tienen enfermedades musculares o cardíacas.',
    nivelRiesgo: 'Medio',
    recomendaciones: 'Ropa cómoda, evitar joyas o gafas duras.',
    ubicacion: { type: 'Point', coordinates: [-63.1732, -17.7554] },
    precio: 150,
    duracion: 'Día completo',
    capacidadMaxima: 15
  },
  {
    nombre: 'Burble Soccer en La Paz (Murillo)',
    descripcion: 'Juego de fútbol en burbujas en La Paz. Riesgo de lesiones leves si no se usa el equipo correctamente.',
    nivelRiesgo: 'Bajo',
    recomendaciones: 'Traer ropa ajustada, equipo se proporciona.',
    ubicacion: { type: 'Point', coordinates: [-68.13679932810294, -16.53010047476593] },
    precio: 120,
    duracion: '1-2 horas',
    capacidadMaxima: 12
  },
  {
    nombre: 'Burble Soccer en Cochabamba (Cercado)',
    descripcion: 'Juego de fútbol en burbujas en Cochabamba. Riesgo de lesiones leves si no se usa el equipo correctamente.',
    nivelRiesgo: 'Bajo',
    recomendaciones: 'Traer ropa ajustada, equipo se proporciona.',
    ubicacion: { type: 'Point', coordinates: [-66.17346618306105, -17.43694543581132] },
    precio: 110,
    duracion: '1-2 horas',
    capacidadMaxima: 12
  },
  {
    nombre: 'Burble Soccer en Santa Cruz (Andrés Ibáñez)',
    descripcion: 'Juego de fútbol en burbujas en Santa Cruz. Riesgo de lesiones leves si no se usa el equipo correctamente.',
    nivelRiesgo: 'Bajo',
    recomendaciones: 'Traer ropa ajustada, equipo se proporciona.',
    ubicacion: { type: 'Point', coordinates: [-63.21995031331534, -17.82086456450191] },
    precio: 100,
    duracion: '1-2 horas',
    capacidadMaxima: 12
  },
  {
    nombre: 'Paintball en La Paz (Murillo)',
    descripcion: 'Juego de estrategia con pintura en La Paz. No recomendado para embarazadas o personas con movilidad reducida.',
    nivelRiesgo: 'Medio',
    recomendaciones: 'Ropa cómoda, camiseta y pantalón largo.',
    ubicacion: { type: 'Point', coordinates: [-68.13679932810294, -16.53010047476593] },
    precio: 200,
    duracion: '2-3 horas',
    capacidadMaxima: 20
  },
  {
    nombre: 'Paintball en Cochabamba (Cercado)',
    descripcion: 'Juego de estrategia con pintura en Cochabamba. No recomendado para embarazadas o personas con movilidad reducida.',
    nivelRiesgo: 'Medio',
    recomendaciones: 'Ropa cómoda, camiseta y pantalón largo.',
    ubicacion: { type: 'Point', coordinates: [-66.17014082094005, -17.36186366958597] },
    precio: 190,
    duracion: '2-3 horas',
    capacidadMaxima: 20
  },
  {
    nombre: 'Paintball en Santa Cruz (Andrés Ibáñez)',
    descripcion: 'Juego de estrategia con pintura en Santa Cruz. No recomendado para embarazadas o personas con movilidad reducida.',
    nivelRiesgo: 'Medio',
    recomendaciones: 'Ropa cómoda, camiseta y pantalón largo.',
    ubicacion: { type: 'Point', coordinates: [-63.1732, -17.7554] },
    precio: 180,
    duracion: '2-3 horas',
    capacidadMaxima: 20
  },
  {
    nombre: 'Puenting en Cochabamba (Cercado)',
    descripcion: 'Salto desde puente en Cochabamba. Contraindicado para diabéticos y afecciones cardíacas.',
    nivelRiesgo: 'Alto',
    recomendaciones: 'Ropa cómoda, lentes, cambio de ropa.',
    ubicacion: { type: 'Point', coordinates: [-66.14065864980006, -17.41570718053793] },
    precio: 380,
    duracion: 'Medio día',
    capacidadMaxima: 4
  },
  {
    nombre: 'Puenting en Santa Cruz (Florida)',
    descripcion: 'Salto desde puente en Santa Cruz. Contraindicado para diabéticos y afecciones cardíacas.',
    nivelRiesgo: 'Alto',
    recomendaciones: 'Ropa cómoda, lentes, cambio de ropa.',
    ubicacion: { type: 'Point', coordinates: [-63.1732, -17.7554] },
    precio: 350,
    duracion: 'Medio día',
    capacidadMaxima: 4
  },
  {
    nombre: 'Kayoning en Santa Cruz (Florida)',
    descripcion: 'Exploración de cañones y ríos en Santa Cruz. Exige buena condición física.',
    nivelRiesgo: 'Alto',
    recomendaciones: 'Neopreno, cuerda, ropa impermeable y protector solar.',
    ubicacion: { type: 'Point', coordinates: [-63.177014488660646, -17.832139219871955] },
    precio: 480,
    duracion: 'Día completo',
    capacidadMaxima: 6
  },
  {
    nombre: 'Kayak en La Paz (Gualberto Villarroel)',
    descripcion: 'Remo en kayak en La Paz. Consultar médico si hay enfermedades previas.',
    nivelRiesgo: 'Medio',
    recomendaciones: 'Chaleco, silbato, ropa de cambio, guantes.',
    ubicacion: { type: 'Point', coordinates: [-68.1289, -16.5083] },
    precio: 220,
    duracion: 'Medio día',
    capacidadMaxima: 8
  },
  {
    nombre: 'Kayak en Cochabamba (Cercado)',
    descripcion: 'Remo en kayak en Cochabamba. Consultar médico si hay enfermedades previas.',
    nivelRiesgo: 'Medio',
    recomendaciones: 'Chaleco, silbato, ropa de cambio, guantes.',
    ubicacion: { type: 'Point', coordinates: [-66.18124710663133, -17.39675018556418] },
    precio: 200,
    duracion: 'Medio día',
    capacidadMaxima: 8
  },
  {
    nombre: 'Kayak en Santa Cruz (Andrés Ibáñez)',
    descripcion: 'Remo en kayak en Santa Cruz. Consultar médico si hay enfermedades previas.',
    nivelRiesgo: 'Medio',
    recomendaciones: 'Chaleco, silbato, ropa de cambio, guantes.',
    ubicacion: { type: 'Point', coordinates: [-63.22804003928974, -17.78883132000016] },
    precio: 190,
    duracion: 'Medio día',
    capacidadMaxima: 8
  }
];

async function registrarActividades() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    for (const act of actividades) {
      const existe = await Actividad.findOne({ nombre: act.nombre });
      if (!existe) {
        const nueva = new Actividad(act);
        await nueva.save();
        console.log(`🆕 Actividad registrada: ${act.nombre} - Bs. ${act.precio}`);
      } else {
        console.log(`🔁 Ya existe: ${act.nombre}`);
      }
    }

    console.log('🎯 Registro completo de actividades.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al registrar:', err.message);
    process.exit(1);
  }
}

registrarActividades();