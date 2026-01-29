const mysql = require('mysql2/promise');
require('dotenv').config();

async function recreateProfesionalesTable() {
  console.log('🔄 Recreando tabla Profesionales con nueva estructura...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecosistema_360'
  });

  try {
    // 1. Desactivar checks de llaves foráneas
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // 2. Eliminar tabla existente
    await connection.query('DROP TABLE IF EXISTS Profesionales');
    console.log('🗑️ Tabla antigua eliminada.');

    // 3. Crear tabla nueva con todos los campos solicitados
    const createTableQuery = `
      CREATE TABLE Profesionales (
        rut_prof VARCHAR(20) PRIMARY KEY,
        nombres VARCHAR(100) NOT NULL,
        ap_paterno VARCHAR(50) NOT NULL,
        ap_materno VARCHAR(50),
        especialidad VARCHAR(100),
        telefono VARCHAR(20),
        direccion VARCHAR(255),
        comuna VARCHAR(100),
        email VARCHAR(100),
        tipo_contrato VARCHAR(50) DEFAULT 'Honorarios',
        valor_hora_base DECIMAL(12, 0) DEFAULT 0,
        registro_sis VARCHAR(50),
        color VARCHAR(20) DEFAULT '#3b82f6',
        url_foto VARCHAR(255),
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await connection.query(createTableQuery);
    console.log('✅ Tabla nueva creada con campos extendidos.');

    // 4. Insertar datos de prueba
    const insertQuery = `
      INSERT INTO Profesionales (rut_prof, nombres, ap_paterno, ap_materno, especialidad, telefono, direccion, comuna, email, tipo_contrato, valor_hora_base, registro_sis, color) VALUES
      ('11.111.111-1', 'Juan', 'Pérez', 'Soto', 'Psicólogo Clínico', '+56911111111', 'Av. Siempre Viva 123', 'Providencia', 'juan.perez@clinica.cl', 'Contratado', 25000, 'REG-001', '#3b82f6'),
      ('22.222.222-2', 'Ana', 'Silva', 'Díaz', 'Psiquiatra', '+56922222222', 'Calle Falsa 123', 'Las Condes', 'ana.silva@clinica.cl', 'Honorarios', 50000, 'REG-002', '#10b981'),
      ('33.333.333-3', 'Roberto', 'Gómez', 'Bolaños', 'Kinesiólogo', '+56933333333', 'Vecindad 8', 'Ñuñoa', 'roberto.g@clinica.cl', 'Mixto', 20000, 'REG-003', '#f59e0b');
    `;
    await connection.query(insertQuery);
    console.log('✅ Datos de prueba insertados.');

    // 5. Reactivar checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n✨ Proceso completado exitosamente.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

recreateProfesionalesTable();
