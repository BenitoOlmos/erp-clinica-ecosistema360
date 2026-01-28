const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetPasswords() {
    console.log('🔄 Reiniciando contraseñas de usuarios demo...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ecosistema_360'
    });

    try {
        // Generar nuevos hashes garantizados
        const salt = await bcrypt.genSalt(10);

        const users = [
            { username: 'admin', pass: 'admin123' },
            { username: 'coordinador', pass: 'coord123' },
            { username: 'doctor', pass: 'doctor123' },
            { username: 'contador', pass: 'conta123' }
        ];

        for (const user of users) {
            const hash = await bcrypt.hash(user.pass, salt);
            console.log(`🔑 Actualizando ${user.username}...`);

            const [result] = await connection.query(
                'UPDATE Usuarios SET password_hash = ? WHERE username = ?',
                [hash, user.username]
            );

            if (result.affectedRows > 0) {
                console.log(`✅ ${user.username} actualizado correctamente.`);
            } else {
                console.log(`⚠️ Usuario ${user.username} no encontrado en la BD.`);
            }
        }

        console.log('\n✨ Contraseñas restauradas. Intenta loguearte ahora.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

resetPasswords();
