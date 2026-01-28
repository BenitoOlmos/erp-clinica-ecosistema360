const express = require('express');
const router = express.Router();
const { login, me, register } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/login', login);

// Rutas protegidas
router.get('/me', authMiddleware, me);
router.post('/register', authMiddleware, register);

module.exports = router;
