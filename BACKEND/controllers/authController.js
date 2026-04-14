
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const enviarEmail = require('../config/email');
const { generarEmailHTML } = require('../config/emailTemplates');
const { registrarAccion } = require('./historialController'); // 👈 Importa el registrador

// Registro de usuario
exports.register = async (req, res) => {
    try {
        const { nombre, email, password, ci, celular, roles, permisos } = req.body;

        // Verificaciones únicas
        if (await User.findOne({ nombre })) return res.status(400).json({ msg: 'El nombre ya está registrado' });
        if (await User.findOne({ email })) return res.status(400).json({ msg: 'El email ya está registrado' });
        if (await User.findOne({ ci })) return res.status(400).json({ msg: 'El CI ya está registrado' });
        if (await User.findOne({ celular })) return res.status(400).json({ msg: 'El celular ya está registrado' });

        // Determinar roles (si no se envía ninguno, usa ['turista'] por defecto)
        const rolesAsignados = roles?.length ? roles : ['turista'];

        // Validar que todos los roles existen
        const rolesDB = await Role.find({ nombre: { $in: rolesAsignados } });
        if (rolesDB.length !== rolesAsignados.length) {
            const rolesExistentes = rolesDB.map(r => r.nombre);
            const rolesNoExistentes = rolesAsignados.filter(r => !rolesExistentes.includes(r));
            return res.status(400).json({ msg: `Los siguientes roles no existen: ${rolesNoExistentes.join(', ')}` });
        }

        // Validar que todos los permisos enviados (si hay) existen en Permission
        if (permisos?.length) {
            const permisosDB = await Permission.find({ codename: { $in: permisos } });
            if (permisosDB.length !== permisos.length) {
                const permisosExistentes = permisosDB.map(p => p.codename);
                const permisosNoExistentes = permisos.filter(p => !permisosExistentes.includes(p));
                return res.status(400).json({ msg: `Los siguientes permisos no existen: ${permisosNoExistentes.join(', ')}` });
            }
        }

        // Obtener permisos desde roles
        const rolesConPermisos = await Role.find({ nombre: { $in: rolesAsignados } }).populate('permisos');
        const permisosDesdeRoles = [
            ...new Set(
                rolesConPermisos.flatMap(role => role.permisos.map(p => p.codename))
            )
        ];

        // Combinar permisos enviados con permisos de roles (sin duplicados)
        const permisosFinales = permisos?.length
            ? Array.from(new Set([...permisosDesdeRoles, ...permisos]))
            : permisosDesdeRoles;

        // Crear usuario
        const nuevoUsuario = new User({
            nombre,
            email,
            password,
            ci,
            celular,
            roles: rolesAsignados,
            permisos: permisosFinales
        });

        await nuevoUsuario.save();

        const usuarioSinPassword = nuevoUsuario.toObject();
        delete usuarioSinPassword.password;


        res.status(201).json({ msg: 'Usuario creado exitosamente', usuario: usuarioSinPassword });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error al crear el usuario' });
    }
};

// Login de usuario
// Login de usuario
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email })
            .populate('roles', 'nombre')              // ← Populate roles
            .populate('permisos', 'codename');        // ← Populate permisos

        if (!user || !(await user.validarPassword(password))) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }
        if (!user.activo) {
            return res.status(403).json({ msg: 'Usuario desactivado' });
        }

        user.ultimoLogin = new Date();
        await user.save();

        await registrarAccion(user._id, 'Inició sesión');

        // ✅ Extraer nombre del rol
        const rolNombre = user.roles[0]?.nombre || null;
        
        // ✅ Extraer codenames de permisos
        const permisosCodenames = user.permisos.map(p => p.codename);


        const token = jwt.sign({ 
            id: user._id, 
            roles: rolNombre,              // ← String: "admin"
            permisos: permisosCodenames    // ← Array: ["ver_usuarios", "crear_reservas", ...]
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            token,
            user: {
                id: user._id,
                nombre: user.nombre,
                email: user.email,
                roles: rolNombre,
                permisos: permisosCodenames
            }
        });
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ msg: 'Error al iniciar sesión' });
    }
};
// Solicitar recuperación de contraseña
exports.solicitarRecuperacion = async (req, res) => {
    try {
        const { email } = req.body;
        const usuario = await User.findOne({ email });
        if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

        const token = crypto.randomBytes(32).toString('hex');
        const expiracion = new Date(Date.now() + 30 * 60 * 1000);

        usuario.tokenRecuperacion = token;
        usuario.expiracionToken = expiracion;
        await usuario.save();

        const link = `${process.env.FRONTEND_URL}/olvidaste-contrasena?token=${token}`;
        const html = generarEmailHTML(usuario.nombre, link);

        await enviarEmail({
            to: usuario.email,
            subject: 'Recuperación de contraseña',
            html
        });

        await registrarAccion(usuario._id, 'Solicitó recuperación de contraseña');

        res.json({ msg: 'Se ha enviado un enlace de recuperación a tu correo' });
    } catch (error) {
        console.error('Error al enviar email:', error);
        res.status(500).json({ msg: 'Error al solicitar recuperación' });
    }
};


// Restablecer contraseña
exports.restablecerPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { nuevaPassword } = req.body;

        if (!nuevaPassword || nuevaPassword.length < 6) {
            return res.status(400).json({ msg: 'La nueva contraseña es obligatoria y debe tener al menos 6 caracteres.' });
        }

        const usuario = await User.findOne({
            tokenRecuperacion: token,
            expiracionToken: { $gt: new Date() }
        });

        if (!usuario) {
            return res.status(400).json({ msg: 'Token inválido o expirado.' });
        }

        usuario.password = nuevaPassword;
        usuario.tokenRecuperacion = undefined;
        usuario.expiracionToken = undefined;
        await usuario.save();

        await registrarAccion(usuario._id, 'Restableció su contraseña');

        res.json({ msg: 'Contraseña restablecida correctamente.' });
    } catch (error) {
        console.error('Error en restablecerPassword:', error);
        res.status(500).json({ msg: 'Error al restablecer contraseña' });
    }
};

exports.getMe = async (req, res) => {
    try {
        console.log('🔍 DEBUG: Entrando a getMe');  // ← AGREGA ESTO
        console.log('🔍 req.userId:', req.userId);

        const user = await User.findById(req.userId)
            .populate('roles', 'nombre descripcion')
            .populate('permisos', 'codename nombre');  // ← DEBE estar esto
        
        console.log('🔍 user:', user);
        console.log('🔍 user.permisos[0]:', user?.permisos[0]);

        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        const userData = {
            id: user._id,
            nombre: user.nombre,
            email: user.email,
            ci: user.ci,
            celular: user.celular,
            activo: user.activo,
            roles: user.roles.map(rol => rol.nombre),
            permisos: user.permisos.map(p => p.codename),  // ← CRÍTICO
            ultimoLogin: user.ultimoLogin,
            createdAt: user.createdAt
        };

        console.log('🔍 userData.permisos:', userData.permisos);

        res.json(userData);
    } catch (err) {
        console.error('❌ Error en getMe:', err);
        res.status(500).json({ msg: 'Error al obtener datos del usuario' });
    }
};