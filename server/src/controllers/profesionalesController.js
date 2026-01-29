const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/profesionales';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Nombre único: rut_timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.body.rut_prof + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Get all profesionales
const getAllProfesionales = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM Profesionales ORDER BY ap_paterno, nombres
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
        const [rows] = await pool.query('SELECT * FROM Profesionales WHERE rut_prof = ?', [rut]);

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
        // Multer procesa multipart/form-data antes de llegar aquí, si usamos el middleware en la ruta.
        // Pero como estamos en el controlador, asumiremos que se llama desde la ruta así: router.post('/', upload.single('foto'), createProfesional)

        const {
            rut_prof, nombres, ap_paterno, ap_materno, especialidad,
            telefono, direccion, comuna, email,
            tipo_contrato, valor_hora_base, registro_sis, color, activo
        } = req.body;

        const url_foto = req.file ? `/uploads/profesionales/${req.file.filename}` : null;

        if (!rut_prof || !nombres || !ap_paterno || !especialidad) {
            return res.status(400).json({ message: 'Campos obligatorios faltantes' });
        }

        const [result] = await pool.query(
            `INSERT INTO Profesionales 
            (rut_prof, nombres, ap_paterno, ap_materno, especialidad, telefono, direccion, comuna, email, tipo_contrato, valor_hora_base, registro_sis, color, url_foto, activo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [rut_prof, nombres, ap_paterno, ap_materno, especialidad, telefono, direccion, comuna, email, tipo_contrato, valor_hora_base || 0, registro_sis, color || '#3b82f6', url_foto, activo !== undefined ? activo : 1]
        );

        res.status(201).json({ message: 'Profesional creado exitosamente', rut_prof });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Ya existe un profesional con este RUT' });
        }
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Update profesional
const updateProfesional = async (req, res) => {
    try {
        const { rut } = req.params;
        const {
            nombres, ap_paterno, ap_materno, especialidad,
            telefono, direccion, comuna, email,
            tipo_contrato, valor_hora_base, registro_sis, color, activo
        } = req.body;

        let query = `UPDATE Profesionales SET 
            nombres = ?, ap_paterno = ?, ap_materno = ?, especialidad = ?, 
            telefono = ?, direccion = ?, comuna = ?, email = ?, 
            tipo_contrato = ?, valor_hora_base = ?, registro_sis = ?, color = ?`;

        const params = [nombres, ap_paterno, ap_materno, especialidad, telefono, direccion, comuna, email, tipo_contrato, valor_hora_base, registro_sis, color];

        if (activo !== undefined) {
            query += `, activo = ?`;
            params.push(activo);
        }

        if (req.file) {
            query += `, url_foto = ?`;
            params.push(`/uploads/profesionales/${req.file.filename}`);
        }

        query += ` WHERE rut_prof = ?`;
        params.push(rut);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Profesional no encontrado' });
        }

        res.json({ message: 'Profesional actualizado exitosamente' });
    } catch (error) {
        console.error(error);
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
    getUsuarioVinculado,
    upload // Exportamos middleware upload
};
