# Guía de Configuración de Base de Datos

## 1️⃣ Instalar MySQL (si no lo tienes)
1. Descarga MySQL Community Server: https://dev.mysql.com/downloads/mysql/
2. Instala y configura con contraseña (o sin contraseña para desarrollo)

## 2️⃣ Configurar la Base de Datos

### Opción A: Usando MySQL Workbench (GUI)
1. Abre MySQL Workbench
2. Conecta a tu servidor local
3. Ejecuta los siguientes scripts en orden:

```sql
-- 1. Crear la base de datos
CREATE DATABASE ecosistema_360;
USE ecosistema_360;

-- 2. Ejecutar schema.sql (copiar todo el contenido del archivo)
-- 3. Ejecutar seed_users.sql
-- 4. Ejecutar seed_clientes.sql (si existe)
-- 5. Ejecutar seed_profesionales.sql
-- 6. Ejecutar seed_citas.sql
```

### Opción B: Usando línea de comandos
```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar scripts
source C:/Users/benit/.gemini/antigravity/playground/fiery-orbit/server/schema.sql
source C:/Users/benit/.gemini/antigravity/playground/fiery-orbit/server/seed_users.sql
source C:/Users/benit/.gemini/antigravity/playground/fiery-orbit/server/seed_profesionales.sql
source C:/Users/benit/.gemini/antigravity/playground/fiery-orbit/server/seed_citas.sql
```

## 3️⃣ Verificar que los usuarios se crearon

```sql
USE ecosistema_360;
SELECT * FROM Usuarios;
```

Deberías ver 4 usuarios:
- admin
- coordinador
- doctor
- contador

## 4️⃣ Configurar el archivo .env

Edita `server/.env` con tus credenciales de MySQL:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_MYSQL
DB_NAME=ecosistema_360
```

## 5️⃣ Iniciar el Servidor

```bash
cd server
npm run dev
```

El servidor debería mostrar: `Server running on port 3000`

## 6️⃣ Iniciar el Frontend

```bash
cd client
npm run dev
```

Abre: http://localhost:5173

## 7️⃣ Probar el Login

Usa cualquiera de estos usuarios:

| Usuario | Contraseña |
|---------|------------|
| admin | admin123 |
| coordinador | coord123 |
| doctor | doctor123 |
| contador | conta123 |

## 🔍 Troubleshooting

### Error: "Cannot connect to database"
- Verifica que MySQL esté corriendo
- Verifica usuario/contraseña en `.env`
- Verifica que el puerto 3306 esté disponible

### Error: "User not found"
- La base de datos no tiene los usuarios
- Ejecuta `seed_users.sql`

### Error: "Invalid credentials"
- Los hashes de contraseñas están mal
- Vuelve a ejecutar `seed_users.sql`

### Error de CORS
- Asegúrate que el servidor backend esté en puerto 3000
- Asegúrate que el frontend esté en puerto 5173
