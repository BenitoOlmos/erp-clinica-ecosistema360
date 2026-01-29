const pool = require('../config/db');

// Get all servicios
const getAllServicios = async (req, res) => {
    try {
        const { activo } = req.query;
        let query = 'SELECT * FROM Servicios';
        const params = [];

        if (activo !== undefined) {
            query += ' WHERE activo = ?';
            params.push(activo === 'true' ? 1 : 0);
        }

        query += ' ORDER BY nombre_servicio';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get servicio by ID
const getServicioById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM Servicios WHERE id_servicio = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new servicio
const createServicio = async (req, res) => {
    try {
        const { nombre_servicio, descripcion_corta, monto, tiempo, tipo, activo } = req.body;

        if (!nombre_servicio || !monto || !tiempo) {
            return res.status(400).json({ message: 'Campos obligatorios faltantes' });
        }

        const [result] = await pool.query(
            `INSERT INTO Servicios (nombre_servicio, descripcion_corta, monto, tiempo, tipo, activo) VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre_servicio, descripcion_corta, monto, tiempo, tipo || 'Presencial', activo !== undefined ? activo : 1]
        );

        res.status(201).json({
            message: 'Servicio creado exitosamente',
            id_servicio: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Update servicio
const updateServicio = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_servicio, descripcion_corta, monto, tiempo, tipo, activo } = req.body;

        const [result] = await pool.query(
            `UPDATE Servicios SET 
            nombre_servicio = ?, descripcion_corta = ?, monto = ?, tiempo = ?, tipo = ?, activo = ?
            WHERE id_servicio = ?`,
            [nombre_servicio, descripcion_corta, monto, tiempo, tipo, activo !== undefined ? activo : 1, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        res.json({ message: 'Servicio actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Delete servicio
const deleteServicio = async (req, res) => {
    try {
        const { id } = req.params;

        // Check dependencies (e.g. Citas) if needed, currently just try delete
        const [result] = await pool.query('DELETE FROM Servicios WHERE id_servicio = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        res.json({ message: 'Servicio eliminado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'No se puede eliminar porque está asociado a citas o reglas de pago.' });
        }
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllServicios,
    getServicioById,
    createServicio,
    updateServicio,
    deleteServicio
};
