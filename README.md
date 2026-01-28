# ERP Clínica Ecosistema 360 - Equilibrar

Sistema integral de gestión para centros de salud con enfoque en atención multiprofesional (Psicología, Kinesiología, Fonoaudiología, Terapia Ocupacional, Nutrición).

## 🏥 Características Principales

- **Gestión de Pacientes**: CRUD completo de clientes con información de salud
- **Gestión de Profesionales**: Control de profesionales con diferentes tipos de contrato
- **Calendario de Citas**: Sistema visual con react-big-calendar para agendar sesiones
- **Autenticación JWT**: Sistema de login con roles (Admin, Coordinador, Profesional, Contador)
- **Estados de Cita**: Agendada, Realizada, Cancelada, No Asistió
- **Modalidades**: Presencial, Online, Domicilio

## 🛠️ Stack Tecnológico

### Backend
- Node.js + Express
- MySQL con XAMPP
- JWT para autenticación
- bcrypt para encriptación

### Frontend
- React 18 + Vite
- React Router DOM
- Axios para API calls
- react-big-calendar para vistas de calendario
- Lucide React para iconos

## 📋 Requisitos Previos

- Node.js 16+
- MySQL (vía XAMPP recomendado)
- npm o yarn

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd "ERP Clinica"
```

### 2. Configurar Base de Datos con XAMPP

1. Abre **XAMPP Control Panel**
2. Inicia **Apache** y **MySQL**
3. Accede a **http://localhost/phpmyadmin**
4. Ejecuta los scripts SQL en orden:
   - `server/schema.sql`
   - `server/seed_users.sql`
   - `server/seed_clientes.sql`
   - `server/seed_profesionales.sql`
   - `server/seed_citas.sql`

### 3. Configurar Variables de Entorno

Crea `server/.env`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ecosistema_360
JWT_SECRET=equilibrar_secret_key_2026_change_in_production
```

### 4. Instalar Dependencias

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 5. Iniciar la Aplicación

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

La aplicación estará disponible en **http://localhost:5174**

## 👥 Usuarios Demo

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| coordinador | coord123 | Coordinador |
| doctor | doctor123 | Profesional |
| contador | conta123 | Contador |

## 📁 Estructura del Proyecto

```
ERP Clinica/
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── config/        # Configuración DB
│   │   ├── controllers/   # Lógica de negocio
│   │   ├── routes/        # Rutas API
│   │   └── middleware/    # Auth middleware
│   ├── schema.sql         # Esquema de base de datos
│   ├── seed_*.sql         # Datos de prueba
│   └── .env               # Variables de entorno
│
├── client/                # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   ├── services/      # API services
│   │   └── context/       # Context API (Auth)
│   └── index.css          # Estilos globales
│
├── SETUP_XAMPP.md         # Guía de instalación XAMPP
└── DIAGNOSTICO.md         # Troubleshooting

```

## 🔒 Seguridad

- ⚠️ **IMPORTANTE**: Los usuarios demo son solo para desarrollo
- Cambia `JWT_SECRET` en producción
- Elimina los seeds en producción
- Nunca subas el archivo `.env` a Git

## 🧪 Testing

1. Verifica la conexión a BD:
```bash
cd server
node test-db.js
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual

### Clientes
- `GET /api/clientes` - Listar pacientes
- `POST /api/clientes` - Crear paciente
- `PUT /api/clientes/:rut` - Actualizar paciente
- `DELETE /api/clientes/:rut` - Eliminar paciente

### Profesionales
- `GET /api/profesionales` - Listar profesionales
- `POST /api/profesionales` - Crear profesional
- `GET /api/profesionales/:rut/usuario` - Usuario vinculado

### Citas
- `GET /api/citas` - Listar citas (con filtros)
- `POST /api/citas` - Crear cita
- `PUT /api/citas/:id/estado` - Cambiar estado
- `DELETE /api/citas/:id` - Eliminar cita

## 🎨 Diseño

- **Tema**: Equilibrar (Azul #0082AD)
- **Estilo**: Glassmorphism / Premium
- **Responsive**: Mobile, Tablet, Desktop

## 📝 Próximas Características

- [ ] Módulo de Empresas
- [ ] Liquidación automática
- [ ] Reportes financieros
- [ ] Gestión de documentos
- [ ] Notificaciones por email/SMS

## 🤝 Contribución

Este es un proyecto privado para Equilibrar.

## 📄 Licencia

Privado - © 2026 Equilibrar

## 📞 Soporte

Para problemas de instalación, revisa `DIAGNOSTICO.md` y `SETUP_XAMPP.md`
