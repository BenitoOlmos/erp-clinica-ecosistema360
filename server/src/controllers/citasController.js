const pool = require('../config/db');

// Get all citas with filters
const getAllCitas = async (req, res) => {
    try {
        const { fecha_desde, fecha_hasta, estado, modalidad, rut_prof, rut_cliente } = req.query;

        let query = `
      SELECT 
        c.*,
        cl.nombres AS cliente_nombres,
        cl.ap_paterno AS cliente_apellido,
        p.especialidad,
        u.nombre_completo AS profesional_nombre
      FROM Calendario c
      LEFT JOIN Clientes cl ON c.rut_cliente = cl.rut_cliente
      LEFT JOIN Profesionales p ON c.rut_prof = p.rut_prof
      LEFT JOIN Usuarios u ON p.rut_prof = u.rut_profesional
      WHERE 1=1
    `;

        const params = [];

        if (fecha_desde) {
            query += ' AND c.fecha_hora >= ?';
            params.push(fecha_desde);
        }

        if (fecha_hasta) {
            query += ' AND c.fecha_hora <= ?';
            params.push(fecha_hasta);
        }

        if (estado) {
            query += ' AND c.estado = ?';
            params.push(estado);
        }

        if (modalidad) {
            query += ' AND c.modalidad = ?';
            params.push(modalidad);
        }

        if (rut_prof) {
            query += ' AND c.rut_prof = ?';
            params.push(rut_prof);
        }

        if (rut_cliente) {
            query += ' AND c.rut_cliente = ?';
            params.push(rut_cliente);
        }

        query += ' ORDER BY c.fecha_hora DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get cita by ID
const getCitaById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`
      SELECT 
        c.*,
        cl.nombres AS cliente_nombres,
        cl.ap_paterno AS cliente_apellido,
        cl.email AS cliente_email,
        p.especialidad,
        u.nombre_completo AS profesional_nombre
      FROM Calendario c
      LEFT JOIN Clientes cl ON c.rut_cliente = cl.rut_cliente
      LEFT JOIN Profesionales p ON c.rut_prof = p.rut_prof
      LEFT JOIN Usuarios u ON p.rut_prof = u.rut_profesional
      WHERE c.id_cita = ?
    `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get citas by profesional
const getCitasByProfesional = async (req, res) => {
    try {
        const { rut } = req.params;
        const [rows] = await pool.query(`
      SELECT 
        c.*,
        cl.nombres AS cliente_nombres,
        cl.ap_paterno AS cliente_apellido
      FROM Calendario c
      LEFT JOIN Clientes cl ON c.rut_cliente = cl.rut_cliente
      WHERE c.rut_prof = ?
      ORDER BY c.fecha_hora DESC
    `, [rut]);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get citas by cliente
const getCitasByCliente = async (req, res) => {
    try {
        const { rut } = req.params;
        const [rows] = await pool.query(`
      SELECT 
        c.*,
        p.especialidad,
        u.nombre_completo AS profesional_nombre
      FROM Calendario c
      LEFT JOIN Profesionales p ON c.rut_prof = p.rut_prof
      LEFT JOIN Usuarios u ON p.rut_prof = u.rut_profesional
      WHERE c.rut_cliente = ?
      ORDER BY c.fecha_hora DESC
    `, [rut]);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new cita
const createCita = async (req, res) => {
    try {
        const { rut_cliente, rut_prof, id_servicio, fecha_hora, estado, modalidad } = req.body;

        // Validaciones
        if (!rut_cliente || !rut_prof || !fecha_hora) {
            return res.status(400).json({ message: 'Cliente, profesional y fecha/hora son requeridos' });
        }

        // Verificar que cliente existe
        const [clientes] = await pool.query('SELECT rut_cliente FROM Clientes WHERE rut_cliente = ?', [rut_cliente]);
        if (clientes.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        // Verificar que profesional existe
        const [profesionales] = await pool.query('SELECT rut_prof FROM Profesionales WHERE rut_prof = ?', [rut_prof]);
        if (profesionales.length === 0) {
            return res.status(404).json({ message: 'Profesional no encontrado' });
        }

        // Verificar conflicto de horario (mismo profesional, misma hora)
        const [conflictos] = await pool.query(
            'SELECT id_cita FROM Calendario WHERE rut_prof = ? AND fecha_hora = ? AND estado != ?',
            [rut_prof, fecha_hora, 'Cancelada']
        );

        if (conflictos.length > 0) {
            return res.status(400).json({ message: 'El profesional ya tiene una cita agendada en ese horario' });
        }

        const [result] = await pool.query(
            'INSERT INTO Calendario (rut_cliente, rut_prof, id_servicio, fecha_hora, estado, modalidad) VALUES (?, ?, ?, ?, ?, ?)',
            [rut_cliente, rut_prof, id_servicio || null, fecha_hora, estado || 'Agendada', modalidad || 'Presencial']
        );

        res.status(201).json({
            message: 'Cita creada exitosamente',
            id_cita: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update cita
const updateCita = async (req, res) => {
    try {
        const { id } = req.params;
        const { rut_cliente, rut_prof, id_servicio, fecha_hora, estado, modalidad } = req.body;

        const [result] = await pool.query(
            'UPDATE Calendario SET rut_cliente = ?, rut_prof = ?, id_servicio = ?, fecha_hora = ?, estado = ?, modalidad = ? WHERE id_cita = ?',
            [rut_cliente, rut_prof, id_servicio, fecha_hora, estado, modalidad, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        res.json({ message: 'Cita actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update only estado
const updateEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!estado) {
            return res.status(400).json({ message: 'Estado es requerido' });
        }

        const [result] = await pool.query(
            'UPDATE Calendario SET estado = ? WHERE id_cita = ?',
            [estado, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        res.json({ message: 'Estado actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete cita
const deleteCita = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM Calendario WHERE id_cita = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        res.json({ message: 'Cita eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllCitas,
    getCitaById,
    getCitasByProfesional,
    getCitasByCliente,
    createCita,
    updateCita,
    updateEstado,
    deleteCita
};
