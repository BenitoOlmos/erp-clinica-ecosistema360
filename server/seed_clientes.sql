-- Script para insertar clientes demo
-- Ejecutar después de schema.sql y seed_users.sql

USE ecosistema_360;

-- Insertar clientes de ejemplo
INSERT INTO Clientes (rut_cliente, nombres, ap_paterno, ap_materno, email, isapre, direccion) VALUES
('12345678-9', 'María', 'González', 'Castro', 'maria.gonzalez@email.com', 'Fonasa', 'Av. Providencia 123, Santiago'),
('98765432-1', 'Pedro', 'Sánchez', 'López', 'pedro.sanchez@email.com', 'Isapre Consalud', 'Calle Los Leones 456, Santiago'),
('11223344-5', 'Ana', 'López', 'Martínez', 'ana.lopez@email.com', 'Fonasa', 'Paseo Bulnes 789, Santiago'),
('44556677-8', 'Carlos', 'Rojas', 'Fernández', 'carlos.rojas@email.com', 'Isapre Banmédica', 'Av. Apoquindo 321, Las Condes'),
('55667788-9', 'Laura', 'Torres', 'Vargas', 'laura.torres@email.com', 'Fonasa', 'Gran Avenida 654, San Miguel');

-- Información de clientes demo:
-- 
-- PACIENTES CREADOS:
--   - María González Castro (12345678-9) - Fonasa
--   - Pedro Sánchez López (98765432-1) - Consalud
--   - Ana López Martínez (11223344-5) - Fonasa
--   - Carlos Rojas Fernández (44556677-8) - Banmédica
--   - Laura Torres Vargas (55667788-9) - Fonasa
