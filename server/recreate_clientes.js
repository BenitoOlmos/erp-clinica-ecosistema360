const mysql = require('mysql2/promise');
require('dotenv').config();

async function recreateClientesTable() {
    console.log('🔄 Recreando tabla Clientes con nueva estructura...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ecosistema_360'
    });

    try {
        // 1. Desactivar checks de llaves foráneas para poder borrar
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // 2. Eliminar tabla existente
        await connection.query('DROP TABLE IF EXISTS Clientes');
        console.log('🗑️ Tabla antigua eliminada.');

        // 3. Crear tabla nueva con telefono y comuna
        const createTableQuery = `
      CREATE TABLE Clientes (
        rut_cliente VARCHAR(12) PRIMARY KEY,
        nombres VARCHAR(100) NOT NULL,
        ap_paterno VARCHAR(50) NOT NULL,
        ap_materno VARCHAR(50),
        fecha_nacimiento DATE,
        email VARCHAR(100),
        telefono VARCHAR(20),
        direccion VARCHAR(255),
        comuna VARCHAR(100),
        region VARCHAR(100),
        prevision VARCHAR(50),
        isapre VARCHAR(50),
        antecedentes_medicos TEXT,
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
        await connection.query(createTableQuery);
        console.log('✅ Tabla nueva creada con columnas: telefono, comuna.');

        // 4. Insertar datos de prueba actualizados
        const insertQuery = `
      INSERT INTO Clientes (rut_cliente, nombres, ap_paterno, ap_materno, email, telefono, direccion, comuna, isapre) VALUES
      ('12345678-9', 'María', 'González', 'Castro', 'maria.gonzalez@email.com', '+56912345678', 'Av. Providencia 123', 'Providencia', 'Fonasa'),
      ('98765432-1', 'Pedro', 'Sánchez', 'López', 'pedro.sanchez@email.com', '+56987654321', 'Calle Los Leones 456', 'Providencia', 'Isapre Consalud'),
      ('11223344-5', 'Ana', 'López', 'Martínez', 'ana.lopez@email.com', '+56911223344', 'Paseo Bulnes 789', 'Santiago', 'Fonasa'),
      ('55667788-9', 'Laura', 'Torres', 'Vargas', 'laura.torres@email.com', '+56955667788', 'Gran Avenida 654', 'San Miguel', 'Fonasa'),
      ('44556677-8', 'Carlos', 'Rojas', 'Fernández', 'carlos.rojas@email.com', '+56944556677', 'Av. Apoquindo 321', 'Las Condes', 'Isapre Banmédica');
    `;
        await connection.query(insertQuery);
        console.log('✅ Datos de prueba insertados (5 clientes).');

        // 5. Reactivar checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('\n✨ Proceso completado exitosamente.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

recreateClientesTable();
