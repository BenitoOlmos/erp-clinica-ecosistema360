require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'erp_clinica'
};

const recreateServicios = async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('🔄 Recreando tabla Servicios...');

        // 1. Disable FK checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // 2. Remove dependencies from ALL tables
        try {
            const [fks] = await connection.query(`
                SELECT TABLE_NAME, CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = '${dbConfig.database}' 
                AND REFERENCED_TABLE_NAME = 'Servicios';
            `);

            for (const fk of fks) {
                console.log(`🔄 Eliminando FK '${fk.CONSTRAINT_NAME}' de tabla '${fk.TABLE_NAME}'...`);
                await connection.query(`ALTER TABLE ${fk.TABLE_NAME} DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
            }
        } catch (err) {
            console.log('⚠️ Aviso: Error verificando FKs.', err.message);
        }

        // 3. Drop existing table
        await connection.query('DROP TABLE IF EXISTS Servicios');
        console.log('🗑️ Tabla antigua eliminada.');

        // 4. Create new table
        const createTableQuery = `
            CREATE TABLE Servicios (
                id_servicio INT AUTO_INCREMENT PRIMARY KEY,
                nombre_servicio VARCHAR(100) NOT NULL,
                descripcion_corta VARCHAR(255),
                monto DECIMAL(12, 0) NOT NULL DEFAULT 0,
                tiempo INT NOT NULL DEFAULT 30 COMMENT 'Duración en minutos',
                tipo VARCHAR(50) NOT NULL DEFAULT 'Presencial',
                activo BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        await connection.query(createTableQuery);
        console.log('✅ Tabla nueva creada.');

        // 5. Update dependent tables (Calendario)
        try {
            // Check if Calendario exists and has id_serv
            const [columns] = await connection.query("SHOW COLUMNS FROM Calendario LIKE 'id_serv'");
            if (columns.length > 0) {
                console.log('🔄 Actualizando columna id_serv a id_servicio en Calendario...');
                await connection.query("ALTER TABLE Calendario CHANGE id_serv id_servicio INT");
            }
        } catch (err) {
            console.log('⚠️ Aviso: No se pudo actualizar Calendario (quizás no existe).');
        }

        // 6. Insert seed data
        const insertQuery = `
            INSERT INTO Servicios (nombre_servicio, descripcion_corta, monto, tiempo, tipo) VALUES
            ('Consulta General', 'Evaluación médica general', 35000, 30, 'Presencial'),
            ('Sesión Psicología', 'Terapia individual', 45000, 50, 'Online'),
            ('Consulta Domiciliaria', 'Atención médica en domicilio', 60000, 60, 'Domicilio'),
            ('Kinesiología', 'Sesión de rehabilitación física', 30000, 45, 'Presencial'),
            ('Telemedicina', 'Consulta médica por videollamada', 30000, 20, 'Online');
        `;
        await connection.query(insertQuery);
        console.log('✅ Datos de prueba insertados.');

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) await connection.end();
    }
};

recreateServicios();
