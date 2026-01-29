const pool = require('../config/db');

// Get all programs with their details
const getAllProgramas = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Programas WHERE activo = 1 ORDER BY nombre');

        // Fetch details for each program
        // This is not N+1 efficient but fine for small number of programs
        const programsWithDetails = await Promise.all(rows.map(async (prog) => {
            const [details] = await pool.query(`
                SELECT ps.*, s.nombre_servicio, p.nombres as nombre_prof, p.ap_paterno as ap_prof
                FROM Programas_Servicios ps
                LEFT JOIN Servicios s ON ps.id_servicio = s.id_servicio
                LEFT JOIN Profesionales p ON ps.rut_prof = p.rut_prof
                WHERE ps.id_programa = ?
            `, [prog.id_programa]);
            return { ...prog, servicios: details };
        }));

        res.json(programsWithDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create Program
const createPrograma = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { nombre, descripcion, precio, servicios } = req.body; // servicios is array of { id_servicio, cantidad, rut_prof }

        const [resProg] = await connection.query(
            'INSERT INTO Programas (nombre, descripcion, precio) VALUES (?, ?, ?)',
            [nombre, descripcion, precio]
        );
        const id_programa = resProg.insertId;

        if (servicios && servicios.length > 0) {
            for (const item of servicios) {
                await connection.query(
                    'INSERT INTO Programas_Servicios (id_programa, id_servicio, cantidad, rut_prof) VALUES (?, ?, ?, ?)',
                    [id_programa, item.id_servicio, item.cantidad, item.rut_prof || null]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Programa creado', id_programa });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};


// Update Program
const updatePrograma = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const { nombre, descripcion, precio, servicios } = req.body;

        // 1. Update basic info
        await connection.query(
            'UPDATE Programas SET nombre = ?, descripcion = ?, precio = ? WHERE id_programa = ?',
            [nombre, descripcion, precio, id]
        );

        // 2. Update services (Delete all and re-insert)
        // Note: Ideally we should diff/update, but full replace is safer for consistency here
        await connection.query('DELETE FROM Programas_Servicios WHERE id_programa = ?', [id]);

        if (servicios && servicios.length > 0) {
            for (const item of servicios) {
                await connection.query(
                    'INSERT INTO Programas_Servicios (id_programa, id_servicio, cantidad, rut_prof) VALUES (?, ?, ?, ?)',
                    [id, item.id_servicio, item.cantidad, item.rut_prof || null]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Programa actualizado correctamente' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

// Assign (Sell) Program to Client
const assignProgramaToCliente = async (req, res) => {
    try {
        const { rut_cliente, id_programa, fecha_compra, pagado, medio_pago } = req.body;

        await pool.query(
            'INSERT INTO Clientes_Programas (rut_cliente, id_programa, fecha_compra, pagado, estado, medio_pago) VALUES (?, ?, ?, ?, ?, ?)',
            [rut_cliente, id_programa, fecha_compra || new Date(), pagado ? 1 : 0, 'Activo', medio_pago || null]
        );

        res.status(201).json({ message: 'Programa asignado al cliente con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete (Deactivate) Program
const deletePrograma = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE Programas SET activo = 0 WHERE id_programa = ?', [id]);
        res.json({ message: 'Programa eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllProgramas,
    createPrograma,
    updatePrograma,
    assignProgramaToCliente,
    deletePrograma
};
