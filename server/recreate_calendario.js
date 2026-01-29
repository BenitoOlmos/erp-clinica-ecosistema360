require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'erp_clinica'
};

const recreateCalendario = async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('🔄 Recreando tabla Calendario...');

        // 1. Disable FK checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // 2. Drop existing table
        await connection.query('DROP TABLE IF EXISTS Calendario');
        console.log('🗑️ Tabla antigua eliminada.');

        // 3. Create new table
        const createTableQuery = `
            CREATE TABLE Calendario (
                id_cita INT AUTO_INCREMENT PRIMARY KEY,
                rut_cliente VARCHAR(20),
                rut_prof VARCHAR(20),
                id_servicio INT,
                fecha DATE NOT NULL,
                hora TIME NOT NULL,
                estado VARCHAR(50) DEFAULT 'Programada',
                modalidad VARCHAR(50),
                comentarios TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (rut_cliente) REFERENCES Clientes(rut_cliente) ON DELETE SET NULL,
                FOREIGN KEY (rut_prof) REFERENCES Profesionales(rut_prof) ON DELETE SET NULL,
                FOREIGN KEY (id_servicio) REFERENCES Servicios(id_servicio) ON DELETE SET NULL
            )
        `;
        await connection.query(createTableQuery);
        console.log('✅ Tabla Calendario creada con fecha y hora separadas.');

        // 4. Insert seed data if needed
        // We will skip seed data for now or add dummy data if useful. 
        // Let's add at least one for testing.
        // Assuming we have some professionals and clients from previous steps.

        // We need to know valid IDs to insert seed data safely, so skipping strict seed for now 
        // or inserting generic ones hoping they exist (risky if tables empty).
        // Best to just create structure.

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
            await connection.end();
        }
    }
};

recreateCalendario();
