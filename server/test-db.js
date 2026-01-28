// Script de prueba de conexión a MySQL
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('========================================');
    console.log('PRUEBA DE CONEXIÓN A BASE DE DATOS');
    console.log('========================================\n');

    console.log('Configuración:');
    console.log('- Host:', process.env.DB_HOST || 'localhost');
    console.log('- User:', process.env.DB_USER || 'root');
    console.log('- Database:', process.env.DB_NAME || 'ecosistema_360');
    console.log('- Password:', process.env.DB_PASSWORD ? '***' : '(vacío)');
    console.log('');

    try {
        console.log('Intentando conectar...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ecosistema_360'
        });

        console.log('✅ Conexión exitosa!\n');

        // Verificar tablas
        console.log('Verificando tablas...');
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tablas encontradas:', tables.length);
        tables.forEach(table => {
            console.log('  -', Object.values(table)[0]);
        });
        console.log('');

        // Verificar usuarios
        console.log('Verificando usuarios...');
        const [users] = await connection.query('SELECT username, nombre_completo, rol FROM Usuarios');
        console.log('Usuarios encontrados:', users.length);
        users.forEach(user => {
            console.log(`  - ${user.username} (${user.rol}): ${user.nombre_completo}`);
        });
        console.log('');

        // Verificar clientes
        const [clientes] = await connection.query('SELECT COUNT(*) as total FROM Clientes');
        console.log('Clientes en BD:', clientes[0].total);

        // Verificar profesionales
        const [profesionales] = await connection.query('SELECT COUNT(*) as total FROM Profesionales');
        console.log('Profesionales en BD:', profesionales[0].total);

        // Verificar citas
        const [citas] = await connection.query('SELECT COUNT(*) as total FROM Calendario');
        console.log('Citas en BD:', citas[0].total);

        await connection.end();
        console.log('\n✅ Todo OK - La base de datos está correcta');

    } catch (error) {
        console.error('\n❌ ERROR DE CONEXIÓN:');
        console.error('Mensaje:', error.message);
        console.error('Código:', error.code);
        console.error('\nPosibles causas:');
        console.error('1. MySQL no está corriendo (verifica XAMPP)');
        console.error('2. Credenciales incorrectas en .env');
        console.error('3. Base de datos "ecosistema_360" no existe');
        process.exit(1);
    }
}

testConnection();
