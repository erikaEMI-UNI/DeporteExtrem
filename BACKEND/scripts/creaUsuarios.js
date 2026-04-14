const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

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

async function crearUsuarios() {
    try {
        console.log('  → Verificando usuarios...');

        // ✅ BUSCAR ROLES EN LA BD (con populate de permisos)
        const rolTurista = await Role.findOne({ nombre: 'turista' }).populate('permisos');
        const rolOperador = await Role.findOne({ nombre: 'operador' }).populate('permisos');
        const rolAdmin = await Role.findOne({ nombre: 'admin' }).populate('permisos');

        if (!rolTurista || !rolOperador || !rolAdmin) {
            console.log('Roles encontrados:', {
                turista: !!rolTurista,
                operador: !!rolOperador,
                admin: !!rolAdmin
            });
            throw new Error('❌ Roles "turista", "operador" y/o "admin" no encontrados en la BD.');
        }

        // ✅ VERIFICAR SI YA EXISTEN USUARIOS
        const turistasExistentes = await User.countDocuments({ roles: rolTurista._id });
        const operadoresExistentes = await User.countDocuments({ roles: rolOperador._id });
        const adminExistente = await User.findOne({ roles: rolAdmin._id });

        // ✅ CREAR ADMIN SI NO EXISTE
        if (!adminExistente) {
    console.log('  → Creando administrador...');
    
    // 🔍 DEBUG
    console.log('rolAdmin.permisos:', rolAdmin.permisos);
    console.log('rolAdmin.permisos[0]:', rolAdmin.permisos[0]);
    console.log('rolAdmin.permisos[0]._id:', rolAdmin.permisos[0]?._id);
    
    // Extraer los ObjectIds de los permisos
    const permisosAdmin = rolAdmin.permisos.map(p => p._id);
    
    // 🔍 DEBUG
    console.log('permisosAdmin:', permisosAdmin);
    console.log('Tipo de permisosAdmin[0]:', typeof permisosAdmin[0]);
    
    const admin = new User({
        nombre: 'Administrador',
        email: 'admin@sistema.com',
        password: 'admin123',
        ci: '0000000',
        celular: '70000000',
        activo: true,
        roles: [rolAdmin._id],
        permisos: permisosAdmin,
    });
    
    // 🔍 DEBUG - Ver qué se va a guardar
    console.log('admin.permisos antes de guardar:', admin.permisos);
    
    await admin.save();
    
    // 🔍 DEBUG - Ver qué se guardó realmente
    const adminGuardado = await User.findById(admin._id);
    console.log('admin.permisos después de guardar:', adminGuardado.permisos);
    
    console.log('  ✓ Administrador creado');
}else {
            console.log('  ✓ Administrador ya existe');
        }

        // ✅ CREAR TURISTAS SI NO EXISTEN
        if (turistasExistentes === 0) {
            console.log('  → Creando turistas...');
            
            // Extraer los ObjectIds de los permisos
            const permisosTurista = rolTurista.permisos.map(p => p._id);
            
            let creados = 0;
            let intentos = 0;
            while (creados < 30 && intentos < 100) {
                const nombre = generarNombreAleatorio();
                const email = generarEmail(nombre, creados, 'turista');
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
                        roles: [rolTurista._id],    // ← ObjectId del rol
                        permisos: permisosTurista,  // ← Array de ObjectIds de permisos
                    });
                    await usuario.save();
                    creados++;
                }
                intentos++;
            }
            console.log(`  ✓ ${creados} turistas creados`);
        } else {
            console.log(`  ✓ Ya existen ${turistasExistentes} turistas`);
        }

        // ✅ CREAR OPERADORES SI NO EXISTEN
        if (operadoresExistentes === 0) {
            console.log('  → Creando operadores...');
            
            // Extraer los ObjectIds de los permisos
            const permisosOperador = rolOperador.permisos.map(p => p._id);
            
            let creados = 0;
            let intentos = 0;
            while (creados < 3 && intentos < 20) {
                const nombre = generarNombreAleatorio();
                const email = generarEmail(nombre, creados, 'operador');
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
                        roles: [rolOperador._id],     // ← ObjectId del rol
                        permisos: permisosOperador,   // ← Array de ObjectIds de permisos
                    });
                    await usuario.save();
                    creados++;
                }
                intentos++;
            }
            console.log(`  ✓ ${creados} operadores creados`);
        } else {
            console.log(`  ✓ Ya existen ${operadoresExistentes} operadores`);
        }

    } catch (err) {
        console.error('  ✗ Error en creaUsuarios:', err);
        throw err;
    }
}

// ✅ EXPORTAMOS la función
module.exports = crearUsuarios;

// ✅ SOLO ejecutamos si se corre directamente
if (require.main === module) {
    require('dotenv').config({ path: '../.env' });
    const mongoose = require('mongoose');
    
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('✅ Conectado a MongoDB');
            return crearUsuarios();
        })
        .then(() => {
            console.log('🚀 Proceso completado');
            process.exit(0);
        })
        .catch((err) => {
            console.error('❌ Error:', err);
            process.exit(1);
        });
}