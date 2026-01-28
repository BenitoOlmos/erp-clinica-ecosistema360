-- Script para insertar profesionales demo
-- Ejecutar después de crear las tablas y los usuarios

USE ecosistema_360;

-- Insertar profesionales de ejemplo
INSERT INTO Profesionales (rut_prof, especialidad, tipo_contrato, valor_hora_base, registro_sis) VALUES
('11111111-1', 'Psicología Clínica', 'Contratado', 25000, 'PSI-001'),
('22222222-2', 'Kinesiología', 'Honorarios', 30000, 'KIN-002'),
('33333333-3', 'Fonoaudiología', 'Mixto', 28000, 'FON-003'),
('44444444-4', 'Terapia Ocupacional', 'Honorarios', 27000, 'TO-004'),
('55555555-5', 'Nutrición', 'Contratado', 22000, 'NUT-005');

-- Vincular el usuario 'doctor' con el primer profesional (Psicólogo)
UPDATE Usuarios SET rut_profesional = '11111111-1' WHERE username = 'doctor';

-- Información de profesionales demo:
-- 
-- 11111111-1: Dr. Juan Pérez (Psicología Clínica) - VINCULADO a usuario 'doctor'
-- 22222222-2: Kinesiología - Honorarios
-- 33333333-3: Fonoaudiología - Mixto
-- 44444444-4: Terapia Ocupacional - Honorarios
-- 55555555-5: Nutrición - Contratado
