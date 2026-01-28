const pool = require('../config/db');

// Get all clients
const getAllClientes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Clientes');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get client by RUT
const getClienteByRut = async (req, res) => {
    try {
        const { rut } = req.params;
        const [rows] = await pool.query('SELECT * FROM Clientes WHERE rut_cliente = ?', [rut]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new client
const createCliente = async (req, res) => {
    try {
        const { rut_cliente, nombres, ap_paterno, ap_materno, email, isapre, direccion } = req.body;

        const [result] = await pool.query(
            'INSERT INTO Clientes (rut_cliente, nombres, ap_paterno, ap_materno, email, isapre, direccion) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [rut_cliente, nombres, ap_paterno, ap_materno, email, isapre, direccion]
        );

        res.status(201).json({ message: 'Cliente creado exitosamente', rut_cliente });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update client
const updateCliente = async (req, res) => {
    try {
        const { rut } = req.params;
        const { nombres, ap_paterno, ap_materno, email, isapre, direccion } = req.body;

        const [result] = await pool.query(
            'UPDATE Clientes SET nombres = ?, ap_paterno = ?, ap_materno = ?, email = ?, isapre = ?, direccion = ? WHERE rut_cliente = ?',
            [nombres, ap_paterno, ap_materno, email, isapre, direccion, rut]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.json({ message: 'Cliente actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete client
const deleteCliente = async (req, res) => {
    try {
        const { rut } = req.params;

        const [result] = await pool.query('DELETE FROM Clientes WHERE rut_cliente = ?', [rut]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllClientes,
    getClienteByRut,
    createCliente,
    updateCliente,
    deleteCliente
};
