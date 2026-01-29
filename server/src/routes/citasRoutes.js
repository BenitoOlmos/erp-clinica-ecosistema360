const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getAllCitas,
    createCita,
    updateCita,
    deleteCita
} = require('../controllers/citasController');

router.use(authMiddleware);

router.get('/', getAllCitas);
router.post('/', createCita);
router.put('/:id', updateCita);
router.delete('/:id', deleteCita);

module.exports = router;
