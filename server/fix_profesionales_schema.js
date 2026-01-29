require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'erp_clinica'
};

const checkAndFixProfesionales = async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('🔍 Verificando tabla Profesionales...');

        const [columns] = await connection.query("SHOW COLUMNS FROM Profesionales LIKE 'activo'");

        if (columns.length === 0) {
            console.log('⚠️ Columna "activo" no encontrada. Agregándola...');
            await connection.query("ALTER TABLE Profesionales ADD COLUMN activo BOOLEAN DEFAULT TRUE AFTER url_foto");
            console.log('✅ Columna "activo" agregada correctamente.');
        } else {
            console.log('✅ Columna "activo" ya existe.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) await connection.end();
    }
};

checkAndFixProfesionales();
