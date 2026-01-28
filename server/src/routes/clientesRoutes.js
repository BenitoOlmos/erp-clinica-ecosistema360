const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getAllClientes,
    getClienteByRut,
    createCliente,
    updateCliente,
    deleteCliente
} = require('../controllers/clientesController');

// Proteger todas las rutas con autenticación
router.use(authMiddleware);

router.get('/', getAllClientes);
router.get('/:rut', getClienteByRut);
router.post('/', createCliente);
router.put('/:rut', updateCliente);
router.delete('/:rut', deleteCliente);

module.exports = router;
