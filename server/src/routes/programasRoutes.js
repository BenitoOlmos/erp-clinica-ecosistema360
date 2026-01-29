const express = require('express');
const router = express.Router();
const controller = require('../controllers/programasController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, controller.getAllProgramas);
router.post('/', protect, controller.createPrograma);
router.put('/:id', protect, controller.updatePrograma);
router.post('/asignar', protect, controller.assignProgramaToCliente);
router.delete('/:id', protect, controller.deletePrograma);

module.exports = router;
