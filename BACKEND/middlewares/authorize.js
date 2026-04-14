const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1];
        
        if (!token) return res.status(401).json({ msg: 'Token no proporcionado' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user || !user.activo) {
            return res.status(403).json({ msg: 'Acceso denegado' });
        }

        // Cargar roles con sus permisos
        const rolesDB = await Role.find({ _id: { $in: user.roles } }).populate('permisos');
        // ✅ EXTRAER NOMBRES de roles
        const rolesNombres = rolesDB.map(rol => rol.nombre);

        // ✅ Obtener CODENAMES de permisos
        const permisosDeRoles = rolesDB.flatMap(rol => rol.permisos.map(p => p.codename));
        const permisosUnicos = [...new Set(permisosDeRoles)];

        // ✅ CREAR un objeto nuevo en vez de modificar user
        req.user = {
            _id: user._id,
            nombre: user.nombre,
            email: user.email,
            activo: user.activo,
            esVip: user.esVip || false,
            roles: rolesNombres,        // ← Strings
            permisos: permisosUnicos    // ← Strings
        };
        req.userId = user._id;

        next();
    } catch (error) {
        console.error('Error en verifyToken:', error.message);
        return res.status(401).json({ msg: 'Token inválido' });
    }
};

const authorize = (requiredPermissions = [], allowedRoles = []) => {
    return (req, res, next) => {
        
        if (!req.user) return res.status(401).json({ msg: 'Usuario no autenticado' });

        const userRoles = req.user.roles || [];
        const userPermissions = req.user.permisos || [];

        const hasRole = allowedRoles.length === 0 || userRoles.some(role => allowedRoles.includes(role));
        const hasPermissions = requiredPermissions.length === 0 || requiredPermissions.every(p => {
            const tiene = userPermissions.includes(p);
            console.log(`🔒 ¿Tiene permiso "${p}"?`, tiene);
            return tiene;
        });

        if (!hasRole || !hasPermissions) {
            return res.status(403).json({ msg: 'Permisos insuficientes' });
        }
        next();
    };
};

// Token opcional — no falla si no hay token, pero setea req.user si el token es válido
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) return next();

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user || !user.activo) return next();

        const rolesDB = await Role.find({ _id: { $in: user.roles } }).populate('permisos');
        const rolesNombres = rolesDB.map(rol => rol.nombre);
        const permisosDeRoles = rolesDB.flatMap(rol => rol.permisos.map(p => p.codename));
        const permisosUnicos = [...new Set(permisosDeRoles)];

        req.user = {
            _id: user._id,
            nombre: user.nombre,
            email: user.email,
            activo: user.activo,
            esVip: user.esVip || false,
            roles: rolesNombres,
            permisos: permisosUnicos
        };
        req.userId = user._id;
        next();
    } catch {
        // Token inválido o expirado — continúa como anónimo
        next();
    }
};

module.exports = { verifyToken, authorize, optionalAuth };