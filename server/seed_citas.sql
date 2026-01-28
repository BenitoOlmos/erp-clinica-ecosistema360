-- Script para insertar citas demo
-- Ejecutar después de tener clientes y profesionales

USE ecosistema_360;

-- Insertar citas de ejemplo
INSERT INTO Calendario (rut_cliente, rut_prof, fecha_hora, estado, modalidad) VALUES
-- Citas agendadas (futuras)
('12345678-9', '11111111-1', '2026-02-05 10:00:00', 'Agendada', 'Presencial'),
('12345678-9', '11111111-1', '2026-02-12 10:00:00', 'Agendada', 'Presencial'),
('98765432-1', '22222222-2', '2026-02-06 15:00:00', 'Agendada', 'Online'),
('11223344-5', '33333333-3', '2026-02-08 09:00:00', 'Agendada', 'Presencial'),
('44556677-8', '44444444-4', '2026-02-10 14:30:00', 'Agendada', 'Domicilio'),

-- Citas realizadas (pasadas)
('12345678-9', '11111111-1', '2026-01-20 10:00:00', 'Realizada', 'Presencial'),
('98765432-1', '22222222-2', '2026-01-22 15:00:00', 'Realizada', 'Online'),
('11223344-5', '33333333-3', '2026-01-25 09:00:00', 'Realizada', 'Presencial'),

-- Citas canceladas
('44556677-8', '55555555-5', '2026-01-28 11:00:00', 'Cancelada', 'Presencial');

-- Información de citas demo:
-- 
-- AGENDADAS (Futuras):
--   - María González (12345678-9) con Psicólogo - 05/02 y 12/02
--   - Pedro Sánchez (98765432-1) con Kinesiólogo - 06/02 Online
--   - Ana López (11223344-5) con Fonoaudiólogo - 08/02
--   - Carlos Rojas (44556677-8) con TO - 10/02 Domicilio
--
-- REALIZADAS (Pasadas):
--   - 3 sesiones completadas en enero
--
-- CANCELADAS:
--   - 1 cita cancelada
