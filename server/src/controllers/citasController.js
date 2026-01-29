const pool = require('../config/db');

// Get all citas (optionally filtered by date range or professional)
const getAllCitas = async (req, res) => {
    try {
        const { start, end, rut_prof } = req.query;
        let query = `
            SELECT c.*, 
                   cl.nombres as nombre_cliente, cl.ap_paterno as ap_cliente,
                   p.nombres as nombre_prof, p.ap_paterno as ap_prof, p.color as color_prof, p.url_foto as foto_prof,
                   s.nombre_servicio, s.tiempo as duracion
            FROM Calendario c
            LEFT JOIN Clientes cl ON c.rut_cliente = cl.rut_cliente
            LEFT JOIN Profesionales p ON c.rut_prof = p.rut_prof
            LEFT JOIN Servicios s ON c.id_servicio = s.id_servicio
            WHERE 1=1
        `;
        const params = [];

        if (start && end) {
            query += ' AND c.fecha BETWEEN ? AND ?';
            params.push(start, end);
        }

        if (rut_prof) {
            query += ' AND c.rut_prof = ?';
            params.push(rut_prof);
        }

        query += ' ORDER BY c.fecha, c.hora';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new cita
const createCita = async (req, res) => {
    try {
        const { rut_cliente, rut_prof, id_servicio, fecha, hora, estado, modalidad, comentarios, monto, tipo_pago, programa, estado_pago } = req.body;

        if (!rut_cliente || !rut_prof || !id_servicio || !fecha || !hora) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        // --- PROGRAM CHECK LOGIC START ---
        let finalMonto = monto || 0;
        let finalEstadoPago = estado_pago || 'Pendiente';
        let finalIdVenta = null;
        let finalPrograma = programa || '';

        // Only check if it's not already explicitly marked as paid or specific types
        if (finalEstadoPago !== 'Pagado') {
            const [sales] = await pool.query(
                `SELECT cp.id_venta, cp.id_programa, p.nombre as nombre_programa 
                 FROM Clientes_Programas cp
                 JOIN Programas p ON cp.id_programa = p.id_programa
                 WHERE cp.rut_cliente = ? AND cp.estado = 'Activo'`,
                [rut_cliente]
            );

            for (const sale of sales) {
                // Check if this program includes the service
                const [progDetails] = await pool.query(
                    'SELECT cantidad FROM Programas_Servicios WHERE id_programa = ? AND id_servicio = ?',
                    [sale.id_programa, id_servicio]
                );

                if (progDetails.length > 0) {
                    const limit = progDetails[0].cantidad;

                    // Check usage for this specific service in this sale
                    const [usage] = await pool.query(
                        'SELECT COUNT(*) as used FROM Calendario WHERE id_venta_programa = ? AND id_servicio = ?',
                        [sale.id_venta, id_servicio]
                    );

                    if (usage[0].used < limit) {
                        // Found a valid program!
                        finalIdVenta = sale.id_venta;
                        finalMonto = 0; // Covered by program
                        finalEstadoPago = 'Pagado';
                        finalPrograma = sale.nombre_programa; // Auto-fill program name
                        console.log(`✅ Cita cubierta por programa: ${sale.nombre_programa} (Venta ID: ${sale.id_venta})`);
                        break; // Stop looking
                    }
                }
            }
        }
        // --- PROGRAM CHECK LOGIC END ---

        const [result] = await pool.query(
            `INSERT INTO Calendario (rut_cliente, rut_prof, id_servicio, fecha, hora, estado, modalidad, comentarios, monto, tipo_pago, programa, estado_pago, id_venta_programa)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [rut_cliente, rut_prof, id_servicio, fecha, hora, estado || 'Programada', modalidad || 'Presencial', comentarios, finalMonto, tipo_pago, finalPrograma, finalEstadoPago, finalIdVenta]
        );

        res.status(201).json({
            message: 'Cita creada exitosamente',
            id_cita: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Update cita
const updateCita = async (req, res) => {
    try {
        const { id } = req.params;
        const { rut_cliente, rut_prof, id_servicio, fecha, hora, estado, modalidad, comentarios, monto, tipo_pago, programa, estado_pago } = req.body;

        const [result] = await pool.query(
            `UPDATE Calendario SET 
             rut_cliente = ?, rut_prof = ?, id_servicio = ?, fecha = ?, hora = ?, 
             estado = ?, modalidad = ?, comentarios = ?, monto = ?, tipo_pago = ?, programa = ?, estado_pago = ?
             WHERE id_cita = ?`,
            [rut_cliente, rut_prof, id_servicio, fecha, hora, estado, modalidad, comentarios, monto, tipo_pago, programa, estado_pago, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        res.json({ message: 'Cita actualizada exitosamente' });
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
    createCita,
    updateCita,
    deleteCita
};
