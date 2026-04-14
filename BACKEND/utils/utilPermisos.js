const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

const RUTAS_DIR = path.join(__dirname, '../routes');

/**
 * Extrae permisos de los archivos de rutas
 */
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

/**
 * Sincroniza permisos con los encontrados en rutas
 */
async function sincronizarPermisos(permisosExtraidos) {
  // Eliminar permisos en BD que no están en rutas
  const permisosEnBD = await Permission.find({});
  for (const permisoBD of permisosEnBD) {
    if (!permisosExtraidos.includes(permisoBD.codename)) {
      await Permission.deleteOne({ _id: permisoBD._id });
      console.log(`🗑️  Permiso eliminado: ${permisoBD.codename}`);
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

  return permisosCreados;
}

/**
 * Crea o actualiza roles del sistema
 */
async function sincronizarRoles(permisosCreados) {
  const permisosIds = permisosCreados.map(p => p._id);

  // Rol Admin
  let rolAdmin = await Role.findOne({ nombre: 'admin' });
  if (!rolAdmin) {
    rolAdmin = new Role({
      nombre: 'admin',
      descripcion: 'Administrador del sistema',
      permisos: permisosIds
    });
    await rolAdmin.save();
    console.log('✅ Rol admin creado');
  } else {
    rolAdmin.permisos = permisosIds;
    await rolAdmin.save();
    console.log('♻️  Rol admin actualizado');
  }

  // Rol Turista (los permisos los gestiona initPermisosTurista — no los resetear aquí)
  let rolTurista = await Role.findOne({ nombre: 'turista' });
  if (!rolTurista) {
    rolTurista = new Role({
      nombre: 'turista',
      descripcion: 'Usuario normal',
      permisos: []   // initPermisosTurista los asignará a continuación
    });
    await rolTurista.save();
    console.log('✅ Rol turista creado');
  } else {
    // ⚠️  NO resetear permisos — initPermisosTurista los sincroniza
    console.log('♻️  Rol turista verificado');
  }

  // Rol Operador (los permisos los gestiona initPermisosOperador — no los resetear aquí)
  let rolOperador = await Role.findOne({ nombre: 'operador' });
  if (!rolOperador) {
    rolOperador = new Role({
      nombre: 'operador',
      descripcion: 'Operador del sistema',
      permisos: []   // initPermisosOperador los asignará a continuación
    });
    await rolOperador.save();
    console.log('✅ Rol operador creado');
  } else {
    // ⚠️  NO resetear permisos — initPermisosOperador los sincroniza
    console.log('♻️  Rol operador verificado');
  }

  return { rolAdmin, rolTurista, rolOperador };
}

/**
 * Crea o actualiza el usuario administrador
 */
async function sincronizarUsuarioAdmin(permisosCreados) {
  // Obtener el ObjectId del rol admin
  const rolAdmin = await Role.findOne({ nombre: 'admin' });
  if (!rolAdmin) {
    throw new Error('Rol admin no encontrado. Debe crearse primero.');
  }

  // Obtener los ObjectIds de todos los permisos
  const permisosIds = permisosCreados.map(p => p._id);
  
  // Buscar usuario admin por email O por celular
  let usuario = await User.findOne({ 
    $or: [
      { email: 'admin@admin.com' },
      { celular: '70000000' }
    ]
  });
  
  if (!usuario) {
    // Crear nuevo usuario
    usuario = new User({
      nombre: 'Administrador',
      email: 'admin@admin.com',
      password: 'admin123', // será hasheado por el pre-save
      ci: '12345678',
      celular: '70000000',
      activo: true,
      roles: [rolAdmin._id],
      permisos: permisosIds,
    });
    await usuario.save();
    console.log('✅ Usuario administrador creado');
  } else {
    // Actualizar usuario existente
    usuario.nombre = 'Administrador';
    usuario.email = 'admin@admin.com';
    usuario.ci = '12345678';
    usuario.celular = '70000000';
    usuario.roles = [rolAdmin._id];
    usuario.permisos = permisosIds;
    usuario.activo = true;
    
    // Solo actualizar password si es diferente (para no re-hashear)
    if (usuario.comparePassword && typeof usuario.comparePassword === 'function') {
      const esIgual = await usuario.comparePassword('admin123');
      if (!esIgual) {
        usuario.password = 'admin123';
      }
    } else {
      // Si no existe el método, simplemente asignar
      usuario.password = 'admin123';
    }
    
    await usuario.save();
    console.log('♻️  Usuario administrador actualizado');
  }

  return usuario;
}

/**
 * Inicializa el sistema de autenticación completo
 * Esta función SIEMPRE se ejecuta (no verifica si hay datos)
 * porque necesita sincronizar permisos con las rutas actuales
 */
async function initAuth() {
  try {
    console.log('🔐 Inicializando sistema de autenticación...');

    // 1. Extraer permisos de las rutas
    const permisosExtraidos = await extraerPermisos();
    console.log(`🔍 Permisos extraídos: ${permisosExtraidos.join(', ')}`);

    // 2. Sincronizar permisos en BD
    const permisosCreados = await sincronizarPermisos(permisosExtraidos);

    // 3. Sincronizar roles
    await sincronizarRoles(permisosCreados);

    // 4. Sincronizar usuario admin
    await sincronizarUsuarioAdmin(permisosCreados);

    console.log('✅ Sistema de autenticación sincronizado correctamente');

  } catch (error) {
    console.error('❌ Error al inicializar autenticación:', error.message);
    throw error;
  }
}

module.exports = initAuth; 
