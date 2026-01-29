const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSchema() {
    console.log('🔄 Actualizando esquema de base de datos...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ecosistema_360'
    });

    try {
        // Intentar agregar columnas
        // Usamos IF NOT EXISTS conceptualmente capturando el error de columna duplicada si ya existe
        try {
            await connection.query('ALTER TABLE Clientes ADD COLUMN telefono VARCHAR(20)');
            console.log('✅ Columna "telefono" agregada.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Columna "telefono" ya existe.');
            } else {
                throw e;
            }
        }

        try {
            await connection.query('ALTER TABLE Clientes ADD COLUMN comuna VARCHAR(100)');
            console.log('✅ Columna "comuna" agregada.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Columna "comuna" ya existe.');
            } else {
                throw e;
            }
        }

        console.log('\n✨ Base de datos actualizada correctamente.');

    } catch (error) {
        console.error('❌ Error actualizando esquema:', error);
    } finally {
        await connection.end();
    }
}

updateSchema();
