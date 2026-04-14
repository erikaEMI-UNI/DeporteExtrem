const User = require('../models/User');
const Role = require('../models/Role');

function generarNombreAleatorio() {
  const nombres = ['Luis', 'Ana', 'Carlos', 'María', 'Jorge', 'Lucía', 'Pedro', 'Elena', 'Miguel', 'Sofía'];
  const apellidos = ['Gómez', 'Pérez', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'García', 'Torres', 'Ramírez', 'Vargas'];
  const nombre = nombres[Math.floor(Math.random() * nombres.length)];
  const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
  return `${nombre} ${apellido}`;
}

function generarCI() {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}

function generarCelular() {
  return '7' + Math.floor(1000000 + Math.random() * 9000000).toString();
}

function generarEmail(nombre, i, rol) {
  return `${nombre.toLowerCase().replace(/ /g, '')}${i}@${rol}.com`;
}

async function usuarioExiste({ email, ci, celular }) {
  return await User.exists({ $or: [{ email }, { ci }, { celular }] });
}

/**
 * Inicializa usuarios de prueba (turistas y operadores)
 * Solo se ejecuta si no existen usuarios de esos roles (excluyendo admin)
 */
async function initUsuarios() {
  try {
    console.log('👥 Verificando usuarios de prueba...');

    // Buscar roles en la BD
    const rolTurista = await Role.findOne({ nombre: 'turista' }).populate('permisos');
    const rolOperador = await Role.findOne({ nombre: 'operador' }).populate('permisos');

    if (!rolTurista || !rolOperador) {
      console.log('⚠️  Roles "turista" y/o "operador" no encontrados');
      return;
    }

    // Verificar cuántos turistas y operadores existen
    const turistasExistentes = await User.countDocuments({ roles: rolTurista._id });
    const operadoresExistentes = await User.countDocuments({ roles: rolOperador._id });

    // Si ya hay turistas Y operadores, no hacer nada
    if (turistasExistentes > 0 && operadoresExistentes > 0) {
      console.log(`ℹ️  Ya existen ${turistasExistentes} turistas y ${operadoresExistentes} operadores`);
      return;
    }

    // Extraer ObjectIds de permisos
    const permisosTurista = rolTurista.permisos.map(p => p._id);
    const permisosOperador = rolOperador.permisos.map(p => p._id);

    let turistasCreados = 0;
    let operadoresCreados = 0;

    // Crear turistas SOLO si no existen
    if (turistasExistentes === 0) {
      console.log('  → Creando turistas...');
      let intentos = 0;
      
      while (turistasCreados < 30 && intentos < 100) {
        const nombre = generarNombreAleatorio();
        const email = generarEmail(nombre, turistasCreados, 'turista');
        const ci = generarCI();
        const celular = generarCelular();

        if (!(await usuarioExiste({ email, ci, celular }))) {
          const usuario = new User({
            nombre,
            email,
            password: 'turista123',
            ci,
            celular,
            activo: true,
            roles: [rolTurista._id],
            permisos: permisosTurista,
          });
          await usuario.save();
          turistasCreados++;
        }
        intentos++;
      }
      console.log(`  ✅ ${turistasCreados} turistas creados`);
    } else {
      console.log(`  ℹ️  Ya existen ${turistasExistentes} turistas`);
    }

    // Crear operadores SOLO si no existen
    if (operadoresExistentes === 0) {
      console.log('  → Creando operadores...');
      let intentos = 0;
      
      while (operadoresCreados < 3 && intentos < 20) {
        const nombre = generarNombreAleatorio();
        const email = generarEmail(nombre, operadoresCreados, 'operador');
        const ci = generarCI();
        const celular = generarCelular();

        if (!(await usuarioExiste({ email, ci, celular }))) {
          const usuario = new User({
            nombre,
            email,
            password: 'operador123',
            ci,
            celular,
            activo: true,
            roles: [rolOperador._id],
            permisos: permisosOperador,
          });
          await usuario.save();
          operadoresCreados++;
        }
        intentos++;
      }
      console.log(`  ✅ ${operadoresCreados} operadores creados`);
    } else {
      console.log(`  ℹ️  Ya existen ${operadoresExistentes} operadores`);
    }

    // Resumen final
    if (turistasCreados > 0 || operadoresCreados > 0) {
      console.log(`✅ Total: ${turistasCreados + operadoresCreados} usuarios de prueba creados`);
    }

  } catch (error) {
    console.error('❌ Error al inicializar usuarios:', error.message);
    throw error;
  }
}

module.exports = initUsuarios;