# Sistema de Autenticación - Equilibrar ERP

## 🔐 Usuarios Demo Predefinidos

El sistema incluye 4 usuarios demo con diferentes roles de acceso:

| Rol | Usuario | Contraseña | Accesos |
|-----|---------|------------|----------|
| 👑 Admin | `admin` | `admin123` | Control total del sistema |
| 📋 Coordinador | `coordinador` | `coord123` | Clientes, Calendario, Reportes |
| 👨‍⚕️ Profesional | `doctor` | `doctor123` | Calendario personal, Fichas clínicas |
| 💰 Contador | `contador` | `conta123` | Liquidaciones, Gastos, Finanzas |

## 📦 Instalación de Base de Datos

### 1. Crear la base de datos

```bash
mysql -u root -p
```

```sql
CREATE DATABASE ecosistema_360;
USE ecosistema_360;
```

### 2. Ejecutar el esquema principal

```bash
mysql -u root -p ecosistema_360 < schema.sql
```

### 3. Insertar usuarios demo

```bash
mysql -u root -p ecosistema_360 < seed_users.sql
```

## 🚀 Ejecutar el Proyecto

### Backend
```bash
cd server
npm run dev
```

### Frontend
```bash
cd client
npm run dev
```

## 🎨 Paleta de Colores Equilibrar

- **Azul Principal**: #0082AD
- **Azul Hover**: #005F85
- **Gris Corporativo**: #6D6E71
- **Fondo**: #F4F7F9
- **Éxito**: #28A745
- **Alerta**: #FFC107
- **Error**: #DC3545

## ✅ Features Implementados

- ✅ Login con JWT (expiración 24h)
- ✅ 4 roles de usuario (Admin, Coordinador, Profesional, Contador)
- ✅ Rutas protegidas en Frontend
- ✅ Rutas protegidas en Backend con middleware
- ✅ Sesión persistente (localStorage)
- ✅ Logout funcional
- ✅ UI Premium con branding Equilibrar
- ✅ Botones de "Quick Fill" para usuarios demo en login

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (salt=10)
- Tokens JWT firmados
- Validación de credenciales en cada request
- Middleware de autenticación en rutas sensibles

⚠️ **IMPORTANTE**: Los usuarios demo son SOLO para desarrollo. En producción eliminarlos y crear usuarios reales con contraseñas seguras.
