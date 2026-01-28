// Script para generar hashes de contraseñas de usuarios demo
const bcrypt = require('bcryptjs');

const users = [
    { username: 'admin', password: 'admin123' },
    { username: 'coordinador', password: 'coord123' },
    { username: 'doctor', password: 'doctor123' },
    { username: 'contador', password: 'conta123' }
];

async function generateHashes() {
    console.log('Generando hashes de contraseñas...\n');

    for (const user of users) {
        const hash = await bcrypt.hash(user.password, 10);
        console.log(`${user.username}:`);
        console.log(`  Password: ${user.password}`);
        console.log(`  Hash: ${hash}\n`);
    }
}

generateHashes();
