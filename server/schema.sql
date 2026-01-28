/* Estructura Lógica para implementación en MySQL */

-- 1. ENTIDADES MAESTRAS

-- Tabla de Usuarios (Autenticación y Roles)
CREATE TABLE IF NOT EXISTS Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150),
    email VARCHAR(100),
    rol ENUM('admin', 'coordinador', 'profesional', 'contador') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    rut_profesional VARCHAR(20), -- FK a Profesionales si aplica (NULL si no es profesional)
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_rol (rol)
);

CREATE TABLE IF NOT EXISTS Clientes (
    rut_cliente VARCHAR(20) PRIMARY KEY,
    nombres VARCHAR(100),
    ap_paterno VARCHAR(100),
    ap_materno VARCHAR(100),
    email VARCHAR(100),
    isapre VARCHAR(50),
    direccion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Profesionales (
    rut_prof VARCHAR(20) PRIMARY KEY,
    especialidad VARCHAR(100),
    tipo_contrato VARCHAR(50),
    valor_hora_base DECIMAL(10, 2),
    registro_sis VARCHAR(50)
);

-- Agregar FK después de crear Profesionales
ALTER TABLE Usuarios 
ADD CONSTRAINT fk_usuario_profesional 
FOREIGN KEY (rut_profesional) REFERENCES Profesionales(rut_prof) 
ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS Empresas (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    razon_social VARCHAR(100),
    rut_empresa VARCHAR(20),
    giro VARCHAR(100)
);

-- 2. OPERACIONES
CREATE TABLE IF NOT EXISTS Servicios (
    id_serv INT AUTO_INCREMENT PRIMARY KEY,
    nombre_servicio VARCHAR(100),
    id_empresa INT,
    precio_lista DECIMAL(10, 2),
    FOREIGN KEY (id_empresa) REFERENCES Empresas(id_empresa)
);

CREATE TABLE IF NOT EXISTS Calendario (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    rut_cliente VARCHAR(20),
    rut_prof VARCHAR(20),
    id_servicio INT,
    fecha_hora DATETIME,
    estado VARCHAR(50), -- Programada, Realizada, Cancelada
    modalidad VARCHAR(50),
    FOREIGN KEY (rut_cliente) REFERENCES Clientes(rut_cliente),
    FOREIGN KEY (rut_prof) REFERENCES Profesionales(rut_prof),
    FOREIGN KEY (id_servicio) REFERENCES Servicios(id_serv)
);

CREATE TABLE IF NOT EXISTS Documentos (
    id_doc INT AUTO_INCREMENT PRIMARY KEY,
    id_cita INT,
    tipo_doc VARCHAR(50),
    contenido_clinico_json JSON,
    FOREIGN KEY (id_cita) REFERENCES Calendario(id_cita)
);

-- 3. NEGOCIO Y FINANZAS
CREATE TABLE IF NOT EXISTS Programas (
    id_prog INT AUTO_INCREMENT PRIMARY KEY,
    rut_cliente VARCHAR(20),
    sesiones_totales INT,
    sesiones_usadas INT,
    valor_venta DECIMAL(10, 2),
    FOREIGN KEY (rut_cliente) REFERENCES Clientes(rut_cliente)
);

CREATE TABLE IF NOT EXISTS Reglas_Pago (
    id_regla INT AUTO_INCREMENT PRIMARY KEY,
    rut_prof VARCHAR(20),
    id_serv INT,
    monto_pago DECIMAL(10, 2),
    tipo_calculo VARCHAR(50), -- Fijo, Porcentaje
    FOREIGN KEY (rut_prof) REFERENCES Profesionales(rut_prof),
    FOREIGN KEY (id_serv) REFERENCES Servicios(id_serv)
);

CREATE TABLE IF NOT EXISTS Gastos_Adm (
    id_gasto INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT,
    monto DECIMAL(10, 2),
    categoria VARCHAR(100),
    es_fijo BOOLEAN,
    FOREIGN KEY (id_empresa) REFERENCES Empresas(id_empresa)
);
