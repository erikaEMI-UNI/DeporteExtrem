require('dotenv').config({path: '../.env'});
const mongoose = require('mongoose');
const User = require('../models/User');
const Permiso = require('../models/Permission');
const Role = require('../models/Role');

const codenamesTurista = [
    'listar_actividades',
    'ver_actividad',
    'ver_mis_reservas',
    'crear_reservas',
    'ver_reserva_especifica',
    'editar_reservas',
    'eliminar_reservas',
    'crear_ficha_medica',
    'ver_ficha_medica',
    'editar_ficha_medica',
    'ver_itinerarios',
    'ver_multimedia'
];

async function asignarPermisosTuristas() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // 1️⃣ Buscar el rol "turista"
        const rolTurista = await Role.findOne({ nombre: 'turista' });
        
        if (!rolTurista) {
            console.log('⚠️  No se encontró el rol "turista" en la BD');
            console.log('💡 Verifica que exista el rol en la colección "roles"');
            process.exit(1);
        }

        console.log(`📌 Rol turista encontrado: ${rolTurista._id}`);

        // 2️⃣ Obtener los ObjectIds de los permisos desde la BD
        const permisos = await Permiso.find({
            codename: { $in: codenamesTurista }
        }).select('_id codename');

        if (permisos.length === 0) {
            console.log('⚠️  No se encontraron permisos en la BD.');
            console.log('💡 Ejecuta primero: node scripts/crearPermisos.js');
            process.exit(1);
        }

        const permisoIds = permisos.map(p => p._id);
        
        console.log(`\n📋 Permisos encontrados: ${permisos.length}`);
        permisos.forEach(p => console.log(`   - ${p.codename}`));

        // 3️⃣ ASIGNAR PERMISOS AL ROL TURISTA
        console.log('\n🔧 Actualizando permisos del rol "turista"...');
        
        const permisosRolActuales = rolTurista.permisos || [];
        const permisosRolActualesStr = permisosRolActuales.map(p => p.toString());
        const nuevosPermisosRol = permisoIds.filter(
            pid => !permisosRolActualesStr.includes(pid.toString())
        );

        if (nuevosPermisosRol.length > 0) {
            rolTurista.permisos = [...permisosRolActuales, ...nuevosPermisosRol];
            await rolTurista.save();
            console.log(`✅ Rol "turista" actualizado → +${nuevosPermisosRol.length} permisos`);
        } else {
            console.log(`🔁 Rol "turista" ya tiene todos los permisos asignados`);
        }

        // 4️⃣ ASIGNAR PERMISOS A USUARIOS CON ROL TURISTA
        console.log('\n🔧 Actualizando usuarios turistas...');
        
        const turistas = await User.find({ roles: rolTurista._id });

        if (turistas.length === 0) {
            console.log('⚠️  No se encontraron usuarios turistas');
            console.log('🎯 Proceso completado (solo se actualizó el rol)');
            process.exit(0);
        }

        console.log(`👥 Turistas encontrados: ${turistas.length}\n`);

        // 5️⃣ Actualizar permisos de cada usuario turista
        let usuariosActualizados = 0;
        
        for (const user of turistas) {
            const permisosActuales = user.permisos || [];
            
            // Convertir ObjectIds actuales a strings para comparar
            const permisosActualesStr = permisosActuales.map(p => p.toString());
            const nuevosPermisos = permisoIds.filter(
                pid => !permisosActualesStr.includes(pid.toString())
            );

            if (nuevosPermisos.length > 0) {
                user.permisos = [...permisosActuales, ...nuevosPermisos];
                await user.save();
                console.log(`✅ ${user.email} → +${nuevosPermisos.length} permisos`);
                usuariosActualizados++;
            } else {
                console.log(`🔁 ${user.email} → Ya tiene todos los permisos`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN:');
        console.log(`   • Permisos asignados al rol: ${nuevosPermisosRol.length > 0 ? 'SÍ' : 'Ya los tenía'}`);
        console.log(`   • Usuarios actualizados: ${usuariosActualizados}/${turistas.length}`);
        console.log('='.repeat(60));
        console.log('\n🎯 Proceso completado exitosamente');
        
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Error:', err);
        process.exit(1);
    }
}

asignarPermisosTuristas();