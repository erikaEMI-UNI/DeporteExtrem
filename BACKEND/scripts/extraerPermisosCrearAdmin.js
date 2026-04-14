require('dotenv').config({path: '../.env'});
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

const RUTAS_DIR = path.join(__dirname, '../routes');

async function extraerPermisos() {
    const permisos = new Set();

    const archivos = fs.readdirSync(RUTAS_DIR).filter(f => f.endsWith('Routes.js'));

    for (const archivo of archivos) {
        const contenido = fs.readFileSync(path.join(RUTAS_DIR, archivo), 'utf-8');
        const regex = /authorize\s*\(\s*\[([^\]]*)\]/g;
        let match;

        while ((match = regex.exec(contenido)) !== null) {
            const permisosEncontrados = match[1]
                .split(',')
                .map(p => p.trim().replace(/['"`]/g, ''))
                .filter(p => p);
            permisosEncontrados.forEach(p => permisos.add(p));
        }
    }

    return [...permisos];
}

async function inicializar() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        const permisosExtraidos = await extraerPermisos();
        console.log(`🔍 Permisos extraídos: ${permisosExtraidos.join(', ')}`);

        // Eliminar permisos en BD que no están en rutas
        const permisosEnBD = await Permission.find({});
        for (const permisoBD of permisosEnBD) {
            if (!permisosExtraidos.includes(permisoBD.codename)) {
                await Permission.deleteOne({ _id: permisoBD._id });
                console.log(`🗑️ Permiso eliminado: ${permisoBD.codename}`);
            }
        }

        // Crear o actualizar permisos que sí están en rutas
        const permisosCreados = [];
        for (const codename of permisosExtraidos) {
            let permiso = await Permission.findOne({ codename });
            if (!permiso) {
                permiso = new Permission({
                    nombre: codename.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    codename
                });
                await permiso.save();
                console.log(`✅ Permiso creado: ${codename}`);
            }
            permisosCreados.push(permiso);
        }

        // Crear o actualizar rol admin
        let rolAdmin = await Role.findOne({ nombre: 'admin' });
        if (!rolAdmin) {
            rolAdmin = new Role({
                nombre: 'admin',
                descripcion: 'Administrador del sistema',
                permisos: permisosCreados.map(p => p._id)
            });
            await rolAdmin.save();
            console.log('✅ Rol admin creado');
        } else {
            rolAdmin.permisos = permisosCreados.map(p => p._id);
            await rolAdmin.save();
            console.log('♻️ Rol admin actualizado');
        }

        // ── Permisos por rol ──────────────────────────────────────────────────────
        const codesPermisosTurista = [
            'listar_actividades', 'ver_actividad',
            'ver_mis_reservas', 'crear_reservas', 'ver_reserva_especifica',
            'editar_reservas', 'eliminar_reservas',
            'crear_ficha_medica', 'ver_ficha_medica', 'editar_ficha_medica',
            'ver_itinerarios', 'ver_multimedia',
        ];

        const codesPermisosOperador = [
            'listar_actividades', 'ver_actividad',
            'ver_reservas',          // lista pre-salida: cargar participantes
            'ver_itinerarios',       // ver itinerarios asignados
            'crear_reporte_actividad',  // crear reporte post-actividad
            'ver_reportes_actividad',   // consultar sus reportes
        ];

        const getIds = (codes) =>
            permisosCreados.filter(p => codes.includes(p.codename)).map(p => p._id);

        // Crear o actualizar rol turista
        let rolTurista = await Role.findOne({ nombre: 'turista' });
        if (!rolTurista) {
            rolTurista = new Role({
                nombre: 'turista',
                descripcion: 'Usuario normal',
                permisos: getIds(codesPermisosTurista)
            });
            await rolTurista.save();
            console.log('✅ Rol turista creado');
        } else {
            rolTurista.permisos = getIds(codesPermisosTurista);
            await rolTurista.save();
            console.log('♻️ Rol turista actualizado');
        }

        // Crear o actualizar rol operador
        let rolOperador = await Role.findOne({ nombre: 'operador' });
        if (!rolOperador) {
            rolOperador = new Role({
                nombre: 'operador',
                descripcion: 'Operador del sistema',
                permisos: getIds(codesPermisosOperador)
            });
            await rolOperador.save();
            console.log('✅ Rol operador creado');
        } else {
            rolOperador.permisos = getIds(codesPermisosOperador);
            await rolOperador.save();
            console.log('♻️ Rol operador actualizado con permisos:', codesPermisosOperador.join(', '));
        }

        // Crear o actualizar usuario admin
        let usuario = await User.findOne({ email: 'admin@admin.com' });
        if (!usuario) {
            usuario = new User({
                nombre: 'Administrador',
                email: 'admin@admin.com',
                password: 'admin123', // será hasheado por el pre-save
                ci: '12345678',
                celular: '70000000',
                activo: true,
                roles: ['admin'],
                permisos: permisosExtraidos,
            });
            await usuario.save();
            console.log('✅ Usuario administrador creado');
        } else {
            usuario.roles = ['admin'];
            usuario.permisos = permisosExtraidos;
            usuario.activo = true;
            await usuario.save();
            console.log('♻️ Usuario administrador actualizado');
        }

        console.log('🚀 Inicialización completa');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}


inicializar();
