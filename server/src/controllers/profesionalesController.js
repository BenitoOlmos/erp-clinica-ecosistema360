const pool = require('../config/db');

// Get all profesionales
const getAllProfesionales = async (req, res) => {
    try {
        // Join con Usuarios para obtener nombre si existe vinculación
        const [rows] = await pool.query(`
      SELECT 
        p.*,
        u.nombre_completo,
        u.email,
        u.username,
        u.id_usuario
      FROM Profesionales p
      LEFT JOIN Usuarios u ON p.rut_prof = u.rut_profesional
      ORDER BY p.rut_prof
    `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get profesional by RUT
const getProfesionalByRut = async (req, res) => {
    try {
        const { rut } = req.params;
        const [rows] = await pool.query(`
      SELECT 
        p.*,
        u.nombre_completo,
        u.email,
        u.username,
        u.id_usuario
      FROM Profesionales p
      LEFT JOIN Usuarios u ON p.rut_prof = u.rut_profesional
      WHERE p.rut_prof = ?
    `, [rut]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Profesional no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new profesional
const createProfesional = async (req, res) => {
    try {
        const { rut_prof, especialidad, tipo_contrato, valor_hora_base, registro_sis } = req.body;

        // Validación básica
        if (!rut_prof || !especialidad || !tipo_contrato) {
            return res.status(400).json({ message: 'RUT, especialidad y tipo de contrato son requeridos' });
        }

        const [result] = await pool.query(
            'INSERT INTO Profesionales (rut_prof, especialidad, tipo_contrato, valor_hora_base, registro_sis) VALUES (?, ?, ?, ?, ?)',
            [rut_prof, especialidad, tipo_contrato, valor_hora_base || 0, registro_sis || null]
        );

        res.status(201).json({
            message: 'Profesional creado exitosamente',
            rut_prof
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Ya existe un profesional con este RUT' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Update profesional
const updateProfesional = async (req, res) => {
    try {
        const { rut } = req.params;
        const { especialidad, tipo_contrato, valor_hora_base, registro_sis } = req.body;

        const [result] = await pool.query(
            'UPDATE Profesionales SET especialidad = ?, tipo_contrato = ?, valor_hora_base = ?, registro_sis = ? WHERE rut_prof = ?',
            [especialidad, tipo_contrato, valor_hora_base, registro_sis, rut]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Profesional no encontrado' });
        }

        res.json({ message: 'Profesional actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete profesional
const deleteProfesional = async (req, res) => {
    try {
        const { rut } = req.params;

        // Primero verificar si tiene usuario vinculado
        const [usuarios] = await pool.query(
            'SELECT id_usuario FROM Usuarios WHERE rut_profesional = ?',
            [rut]
        );

        if (usuarios.length > 0) {
            return res.status(400).json({
                message: 'No se puede eliminar. Tiene un usuario vinculado. Desvincule primero.'
            });
        }

        const [result] = await pool.query('DELETE FROM Profesionales WHERE rut_prof = ?', [rut]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Profesional no encontrado' });
        }

        res.json({ message: 'Profesional eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get usuario vinculado a un profesional
const getUsuarioVinculado = async (req, res) => {
    try {
        const { rut } = req.params;

        const [rows] = await pool.query(
            'SELECT id_usuario, username, nombre_completo, email, rol FROM Usuarios WHERE rut_profesional = ?',
            [rut]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No hay usuario vinculado a este profesional' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllProfesionales,
    getProfesionalByRut,
    createProfesional,
    updateProfesional,
    deleteProfesional,
    getUsuarioVinculado
};
