require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'erp_clinica'
};

const updateCalendarioSchema = async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('🔄 Actualizando esquema de tabla Calendario...');

        // Query to check if columns exist to avoid errors
        const [columns] = await connection.query("SHOW COLUMNS FROM Calendario");
        const existingColumns = columns.map(c => c.Field);

        const columnsToAdd = [];

        if (!existingColumns.includes('monto')) {
            columnsToAdd.push("ADD COLUMN monto DECIMAL(12,0) DEFAULT 0");
        }
        if (!existingColumns.includes('tipo_pago')) {
            columnsToAdd.push("ADD COLUMN tipo_pago VARCHAR(50)");
        }
        if (!existingColumns.includes('programa')) {
            columnsToAdd.push("ADD COLUMN programa VARCHAR(100)");
        }
        if (!existingColumns.includes('estado_pago')) {
            columnsToAdd.push("ADD COLUMN estado_pago VARCHAR(50) DEFAULT 'Pendiente'");
        }

        if (columnsToAdd.length > 0) {
            const alterQuery = `ALTER TABLE Calendario ${columnsToAdd.join(', ')}`;
            await connection.query(alterQuery);
            console.log('✅ Nuevas columnas agregadas: monto, tipo_pago, programa, estado_pago.');
        } else {
            console.log('ℹ️ Las columnas ya existen.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) await connection.end();
    }
};

updateCalendarioSchema();
