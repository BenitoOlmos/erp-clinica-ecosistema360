const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

const authMiddleware = (req, res, next) => {
    try {
        // Obtener token del header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token no proporcionado' });
        }

        const token = authHeader.substring(7); // Remover "Bearer "

        // Verificar token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Adjuntar usuario al request
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' });
        }
        return res.status(401).json({ message: 'Token inválido' });
    }
};

module.exports = authMiddleware;
