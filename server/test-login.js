// Script para probar el login directamente
const axios = require('axios');

async function testLogin() {
    console.log('===========================================');
    console.log('PRUEBA DE LOGIN API');
    console.log('===========================================\n');

    try {
        console.log('Probando login con admin/admin123...');
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });

        console.log('\n✅ LOGIN EXITOSO!\n');
        console.log('Token recibido:', response.data.token ? '***' + response.data.token.substring(response.data.token.length - 10) : 'NO TOKEN');
        console.log('Usuario:', response.data.user);
        console.log('\nEl backend está funcionando correctamente.');

    } catch (error) {
        console.error('\n❌ ERROR EN LOGIN:');

        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Mensaje:', error.response.data);
        } else if (error.request) {
            console.error('No se recibió respuesta del servidor.');
            console.error('¿El backend está corriendo en puerto 3000?');
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
