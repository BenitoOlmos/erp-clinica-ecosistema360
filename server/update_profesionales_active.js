require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'erp_clinica'
};

const setProfesionalesActive = async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('🔄 Actualizando estado activo de profesionales...');

        // Update all to active where active is NULL or 0 (if we want to reset)
        // Better: Update NULLs to 1.
        await connection.query("UPDATE Profesionales SET activo = 1 WHERE activo IS NULL");
        console.log('✅ Profesionales actualizados (NULL -> 1).');

        // Check if any referential integrity issues or just info
        const [rows] = await connection.query("SELECT count(*) as count FROM Profesionales WHERE activo = 1");
        console.log(`ℹ️ Total profesionales activos: ${rows[0].count}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) await connection.end();
    }
};

setProfesionalesActive();
