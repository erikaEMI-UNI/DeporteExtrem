// scripts/migrarCapacidad.js
require('dotenv').config({path: '../.env'});
const mongoose = require('mongoose');
const Actividad = require('../models/Actividad');

async function migrar() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  await Actividad.updateMany(
    { capacidadMaxima: { $exists: false } },
    { $set: { 
      capacidadMaxima: 10, 
      precio: 200, 
      duracion: 'Medio día' 
    }}
  );
  
  console.log('✅ Migración completa');
  process.exit(0);
}

migrar();