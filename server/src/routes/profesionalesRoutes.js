const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getAllProfesionales,
    getProfesionalByRut,
    createProfesional,
    updateProfesional,
    deleteProfesional,
    getUsuarioVinculado
} = require('../controllers/profesionalesController');

// Proteger todas las rutas
router.use(authMiddleware);

router.get('/', getAllProfesionales);
router.get('/:rut', getProfesionalByRut);
router.get('/:rut/usuario', getUsuarioVinculado);
router.post('/', createProfesional);
router.put('/:rut', updateProfesional);
router.delete('/:rut', deleteProfesional);

module.exports = router;
