require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'erp_clinica'
};

const createProgramasTables = async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('🏗️ Creando tablas para módulo Programas...');

        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // 1. Tabla Programas
        await connection.query('DROP TABLE IF EXISTS Programas_Servicios');
        await connection.query('DROP TABLE IF EXISTS Clientes_Programas');
        await connection.query('DROP TABLE IF EXISTS Programas');

        await connection.query(`
            CREATE TABLE Programas (
                id_programa INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                descripcion TEXT,
                precio INT NOT NULL DEFAULT 0,
                activo BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        // 2. Tabla Programas_Servicios (Detalle del programa)
        // Ensure collation matches if that was an issue, but InnoDB usually handles it.
        await connection.query(`
            CREATE TABLE Programas_Servicios (
                id_detalle INT AUTO_INCREMENT PRIMARY KEY,
                id_programa INT,
                id_servicio INT,
                cantidad INT DEFAULT 1,
                rut_prof VARCHAR(20) NULL, 
                FOREIGN KEY (id_programa) REFERENCES Programas(id_programa) ON DELETE CASCADE,
                FOREIGN KEY (id_servicio) REFERENCES Servicios(id_servicio) ON DELETE SET NULL,
                FOREIGN KEY (rut_prof) REFERENCES Profesionales(rut_prof) ON DELETE SET NULL
            ) ENGINE=InnoDB;
        `);

        // 3. Tabla Clientes_Programas (Ventas)
        await connection.query(`
            CREATE TABLE Clientes_Programas (
                id_venta INT AUTO_INCREMENT PRIMARY KEY,
                rut_cliente VARCHAR(20),
                id_programa INT,
                fecha_compra DATE DEFAULT (CURRENT_DATE),
                estado VARCHAR(50) DEFAULT 'Activo',
                pagado BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (rut_cliente) REFERENCES Clientes(rut_cliente) ON DELETE CASCADE,
                FOREIGN KEY (id_programa) REFERENCES Programas(id_programa) ON DELETE SET NULL
            ) ENGINE=InnoDB;
        `);

        // 4. Actualizar Calendario
        const [columns] = await connection.query("SHOW COLUMNS FROM Calendario");
        const existingColumns = columns.map(c => c.Field);
        if (!existingColumns.includes('id_venta_programa')) {
            await connection.query("ALTER TABLE Calendario ADD COLUMN id_venta_programa INT NULL");
            await connection.query("ALTER TABLE Calendario ADD CONSTRAINT fk_cita_programa FOREIGN KEY (id_venta_programa) REFERENCES Clientes_Programas(id_venta) ON DELETE SET NULL");
            console.log('✅ Columna id_venta_programa agregada a Calendario.');
        }

        console.log('✅ Tablas de Programas creadas exitosamente.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
            await connection.end();
        }
    }
};

createProgramasTables();
