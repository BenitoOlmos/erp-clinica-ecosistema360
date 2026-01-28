const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';
const JWT_EXPIRES_IN = '24h';

// Login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validar que existan credenciales
        if (!username || !password) {
            return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
        }

        // Buscar usuario
        const [users] = await pool.query(
            'SELECT * FROM Usuarios WHERE username = ? AND activo = TRUE',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = users[0];

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: user.id_usuario,
                username: user.username,
                rol: user.rol
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Retornar usuario sin contraseña
        const { password_hash, ...userWithoutPassword } = user;

        res.json({
            message: 'Login exitoso',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get current user
const me = async (req, res) => {
    try {
        const userId = req.user.id;

        const [users] = await pool.query(
            'SELECT id_usuario, username, nombre_completo, email, rol, activo, rut_profesional FROM Usuarios WHERE id_usuario = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Register (solo admin puede crear usuarios)
const register = async (req, res) => {
    try {
        const { username, password, nombre_completo, email, rol, rut_profesional } = req.body;

        // Validar rol del usuario actual
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ message: 'Solo administradores pueden crear usuarios' });
        }

        // Hash de contraseña
        const password_hash = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO Usuarios (username, password_hash, nombre_completo, email, rol, rut_profesional) VALUES (?, ?, ?, ?, ?, ?)',
            [username, password_hash, nombre_completo, email, rol, rut_profesional || null]
        );

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            id_usuario: result.insertId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'El nombre de usuario ya existe' });
        }
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    login,
    me,
    register
};
