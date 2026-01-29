require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'erp_clinica'
};

const seedCalendario = async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('🌱 Sembrando datos en Calendario...');

        // Get some IDs
        const [profesionales] = await connection.query('SELECT rut_prof FROM Profesionales LIMIT 1');
        const [clientes] = await connection.query('SELECT rut_cliente FROM Clientes LIMIT 1');
        const [servicios] = await connection.query('SELECT id_servicio FROM Servicios LIMIT 1');

        if (profesionales.length === 0 || clientes.length === 0 || servicios.length === 0) {
            console.log('⚠️ Faltan datos maestros (Profesionales, Clientes o Servicios). Crea algunos primero.');
            return;
        }

        const rut_prof = profesionales[0].rut_prof;
        const rut_cliente = clientes[0].rut_cliente;
        const id_servicio = servicios[0].id_servicio;

        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        const insertQuery = `
            INSERT INTO Calendario (rut_cliente, rut_prof, id_servicio, fecha, hora, estado, modalidad, comentarios)
            VALUES 
            (?, ?, ?, ?, '09:00', 'Programada', 'Presencial', 'Evaluación inicial'),
            (?, ?, ?, ?, '10:30', 'Programada', 'Online', 'Seguimiento'),
            (?, ?, ?, ?, '15:00', 'Confirmada', 'Presencial', 'Terapia')
        `;

        await connection.query(insertQuery, [
            rut_cliente, rut_prof, id_servicio, today,
            rut_cliente, rut_prof, id_servicio, today,
            rut_cliente, rut_prof, id_servicio, tomorrow
        ]);

        console.log('✅ Citas insertadas.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) await connection.end();
    }
};

seedCalendario();
