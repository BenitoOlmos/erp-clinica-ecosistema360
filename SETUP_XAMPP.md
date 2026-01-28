# Configuración con XAMPP - Paso a Paso

## 1️⃣ Iniciar XAMPP

1. Abre **XAMPP Control Panel**
2. Click en **Start** en la fila de **Apache** (para phpMyAdmin)
3. Click en **Start** en la fila de **MySQL**
4. Ambos deben mostrar el fondo verde cuando estén activos

## 2️⃣ Acceder a phpMyAdmin

1. Abre tu navegador
2. Ve a: http://localhost/phpmyadmin
3. Deberías ver la interfaz de phpMyAdmin

## 3️⃣ Crear la Base de Datos

En phpMyAdmin:

1. Click en la pestaña **"SQL"** (arriba)
2. Copia y pega este código:

```sql
CREATE DATABASE ecosistema_360;
USE ecosistema_360;
```

3. Click en **"Continuar"** o **"Go"**

## 4️⃣ Ejecutar el Schema (Crear Tablas)

1. Con la base de datos `ecosistema_360` seleccionada (izquierda)
2. Click en la pestaña **"SQL"** nuevamente
3. Abre el archivo: `C:\Users\benit\OneDrive\Escritorio\PROYECTOS\ERP Clinica\server\schema.sql`
4. **Copia TODO el contenido** del archivo
5. **Pega** en el área SQL de phpMyAdmin
6. Click en **"Continuar"**

Deberías ver las tablas creadas en el panel izquierdo.

## 5️⃣ Insertar Usuarios Demo

1. Click en la pestaña **"SQL"** otra vez
2. Abre el archivo: `C:\Users\benit\OneDrive\Escritorio\PROYECTOS\ERP Clinica\server\seed_users.sql`
3. **Copia TODO el contenido**
4. **Pega** en phpMyAdmin
5. Click en **"Continuar"**

## 6️⃣ Verificar que los Usuarios se Crearon

1. En el panel izquierdo, click en la tabla **"Usuarios"**
2. Click en la pestaña **"Examinar"** o **"Browse"**
3. Deberías ver 4 usuarios:
   - admin
   - coordinador
   - doctor
   - contador

## 7️⃣ (OPCIONAL) Insertar Datos Demo

**IMPORTANTE: Ejecutar en ESTE ORDEN** (cada uno en la pestaña SQL):

1. **`seed_clientes.sql`** - Crea los pacientes
2. **`seed_profesionales.sql`** - Crea los profesionales  
3. **`seed_citas.sql`** - Crea las citas (requiere clientes y profesionales)

## 8️⃣ Configurar el Archivo .env

El archivo ya está configurado para XAMPP por defecto:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ecosistema_360
```

⚠️ **IMPORTANTE**: Si configuraste una contraseña en XAMPP para MySQL, agrégala en `DB_PASSWORD=`

## 9️⃣ Iniciar el Backend

Abre una terminal en la carpeta del proyecto:

```bash
cd server
npm run dev
```

Deberías ver: `Server running on port 3000`

## 🔟 Iniciar el Frontend

Abre **OTRA** terminal:

```bash
cd client
npm run dev
```

Deberías ver: `Local: http://localhost:5173`

## 1️⃣1️⃣ Probar el Login

1. Abre tu navegador en: **http://localhost:5173**
2. Verás la pantalla de Login de EQUILIBRAR
3. Prueba con:

| Usuario | Contraseña |
|---------|------------|
| admin | admin123 |
| coordinador | coord123 |
| doctor | doctor123 |
| contador | conta123 |

4. Click en los botones de Usuario Demo para auto-completar
5. Click en **"Iniciar Sesión"**

## ✅ Si Todo Funcionó

Deberías ver:
- El Dashboard de Equilibrar
- Tu nombre de usuario en el header
- El menú lateral con: Dashboard, Pacientes, Profesionales, Calendario

---

## 🔴 Problemas Comunes

### "Error connecting to database"
- MySQL en XAMPP no está iniciado (debe estar verde)
- Verifica que el puerto 3306 esté libre

### "Cannot POST /api/auth/login"
- El servidor backend no está corriendo
- Ejecuta `npm run dev` en la carpeta `server`

### "Network Error"
- El frontend no puede conectar al backend
- Asegúrate que el backend esté en puerto 3000
- Asegúrate que el frontend esté en puerto 5173

### Página en blanco
- Abre la consola del navegador (F12)
- Revisa si hay errores
- Verifica que ejecutaste `npm install` en ambas carpetas

---

## 📝 Resumen de Comandos

```bash
# Terminal 1 - Backend
cd "C:\Users\benit\OneDrive\Escritorio\PROYECTOS\ERP Clinica\server"
npm run dev

# Terminal 2 - Frontend
cd "C:\Users\benit\OneDrive\Escritorio\PROYECTOS\ERP Clinica\client"
npm run dev
```

**URLs Importantes:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- phpMyAdmin: http://localhost/phpmyadmin
