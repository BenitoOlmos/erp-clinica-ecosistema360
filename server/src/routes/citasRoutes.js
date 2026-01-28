const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getAllCitas,
    getCitaById,
    getCitasByProfesional,
    getCitasByCliente,
    createCita,
    updateCita,
    updateEstado,
    deleteCita
} = require('../controllers/citasController');

// Proteger todas las rutas
router.use(authMiddleware);

router.get('/', getAllCitas);
router.get('/:id', getCitaById);
router.get('/profesional/:rut', getCitasByProfesional);
router.get('/cliente/:rut', getCitasByCliente);
router.post('/', createCita);
router.put('/:id', updateCita);
router.put('/:id/estado', updateEstado);
router.delete('/:id', deleteCita);

module.exports = router;
