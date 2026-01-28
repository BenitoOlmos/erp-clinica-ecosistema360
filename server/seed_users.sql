-- Script para crear usuarios demo
-- Ejecutar después de crear las tablas con schema.sql

USE ecosistema_360;

-- Insertar usuarios demo (contraseñas hasheadas con bcrypt salt=10)

INSERT INTO Usuarios (username, password_hash, nombre_completo, email, rol) VALUES
-- Usuario: admin | Password: admin123
('admin', '$2b$10$WRgb6jeIoUKApVOIWv14ouhMHaUTEkj6UDikLGvGkKOQYNjeny7m6', 'Administrador Sistema', 'admin@equilibrar.cl', 'admin'),

-- Usuario: coordinador | Password: coord123
('coordinador', '$2b$10$KC/KpC1AXrWo7x6KI8zJQeVBxQT.h5.t4QNIy8l2VKLJUk6eXQcQS', 'María González', 'coordinacion@equilibrar.cl', 'coordinador'),

-- Usuario: doctor | Password: doctor123
('doctor', '$2b$10$zCxeLRRdw/oWbTHyjteSmOV.mwMaVxhpfJL3CW1NMvXiPX6mUVVYa', 'Dr. Juan Pérez', 'jperez@equilibrar.cl', 'profesional'),

-- Usuario: contador | Password: conta123
('contador', '$2b$10$ZyuNoPCS9zmUpraAeY5JzuOOMROGRNFhcq2.FrILt90BgDMFapity', 'Carlos Muñoz', 'contabilidad@equilibrar.cl', 'contador');

-- ============================================
-- INFORMACIÓN DE LOGIN - USUARIOS DEMO
-- ============================================
--
-- 👑 ADMINISTRADOR
--   Usuario: admin
--   Password: admin123
--   Acceso: Control total del sistema
--
-- 📋 COORDINADOR
--   Usuario: coordinador
--   Password: coord123
--   Acceso: Clientes, Calendario, Reportes
--
-- 👨‍⚕️ PROFESIONAL (Doctor)
--   Usuario: doctor
--   Password: doctor123
--   Acceso: Calendario personal, Fichas clínicas
--
-- 💰 CONTADOR
--   Usuario: contador
--   Password: conta123
--   Acceso: Liquidaciones, Gastos, Finanzas
--
-- NOTA: Estos usuarios son SOLO para desarrollo/demo.
-- En producción deben eliminarse y crear usuarios reales.
