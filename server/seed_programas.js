require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'erp_clinica'
};

const seedProgramas = async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('🌱 Sembrando programas de prueba...');

        // Verify services exist
        const [services] = await connection.query('SELECT * FROM Servicios');
        const kine = services.find(s => s.nombre_servicio.includes('Kinesiol'));
        const psico = services.find(s => s.nombre_servicio.includes('Psicolog'));
        const gral = services.find(s => s.nombre_servicio.includes('General'));
        const tele = services.find(s => s.nombre_servicio.includes('Telemedicina'));

        // Define Programs
        const programas = [
            {
                nombre: 'Programa Rehabilitación Integral',
                descripcion: 'Recuperación física y seguimiento médico completo. Incluye sesiones intensivas de kinesiología y control médico.',
                precio: 950000,
                items: [
                    { id_servicio: kine?.id_servicio || 4, cantidad: 4 }, // 4 Kine
                    { id_servicio: gral?.id_servicio || 1, cantidad: 2 }, // 2 General
                    { id_servicio: psico?.id_servicio || 2, cantidad: 2 }  // 2 Psico
                ]
            },
            {
                nombre: 'Plan Salud Mental y Física',
                descripcion: 'Enfoque multidisciplinario para el bienestar total. Énfasis en psicología con apoyo físico complementario.',
                precio: 1050000,
                items: [
                    { id_servicio: psico?.id_servicio || 2, cantidad: 4 }, // 4 Psico
                    { id_servicio: kine?.id_servicio || 4, cantidad: 3 }, // 3 Kine
                    { id_servicio: tele?.id_servicio || 5, cantidad: 1 }  // 1 Telemedicina
                ]
            }
        ];

        for (const prog of programas) {
            // Insert Program
            const [res] = await connection.query(
                'INSERT INTO Programas (nombre, descripcion, precio, activo) VALUES (?, ?, ?, 1)',
                [prog.nombre, prog.descripcion, prog.precio]
            );
            const id_programa = res.insertId;
            console.log(`✅ Creado programa: ${prog.nombre} (ID: ${id_programa})`);

            // Insert Details
            for (const item of prog.items) {
                if (item.id_servicio) {
                    await connection.query(
                        'INSERT INTO Programas_Servicios (id_programa, id_servicio, cantidad) VALUES (?, ?, ?)',
                        [id_programa, item.id_servicio, item.cantidad]
                    );
                }
            }
        }

        console.log('✨ Programas creados exitosamente.');

    } catch (error) {
        console.error('❌ Error al sembrar programas:', error);
    } finally {
        if (connection) await connection.end();
    }
};

seedProgramas();
