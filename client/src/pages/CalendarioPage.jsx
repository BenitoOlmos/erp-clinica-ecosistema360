import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { citasService, clientesService, profesionalesService } from '../services/api';
import { Plus, List, Calendar as CalendarIcon } from 'lucide-react';

moment.locale('es');
const localizer = momentLocalizer(moment);

export const CalendarioPage = () => {
    const [citas, setCitas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [profesionales, setProfesionales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
    const [formData, setFormData] = useState({
        rut_cliente: '',
        rut_prof: '',
        fecha_hora: '',
        estado: 'Agendada',
        modalidad: 'Presencial'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [citasRes, clientesRes, profesionalesRes] = await Promise.all([
                citasService.getAll({}),
                clientesService.getAll(),
                profesionalesService.getAll()
            ]);
            setCitas(citasRes.data);
            setClientes(clientesRes.data);
            setProfesionales(profesionalesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await citasService.create(formData);
            setShowModal(false);
            fetchData();
            setFormData({
                rut_cliente: '',
                rut_prof: '',
                fecha_hora: '',
                estado: 'Agendada',
                modalidad: 'Presencial'
            });
        } catch (error) {
            console.error('Error creating cita:', error);
            alert(error.response?.data?.message || 'Error al crear cita');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar esta cita?')) return;

        try {
            await citasService.delete(id);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al eliminar cita');
        }
    };

    const handleChangeEstado = async (id, nuevoEstado) => {
        try {
            await citasService.updateEstado(id, nuevoEstado);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al actualizar estado');
        }
    };

    // Convertir citas para react-big-calendar
    const events = citas.map(cita => ({
        id: cita.id_cita,
        title: `${cita.cliente_nombres} ${cita.cliente_apellido} - ${cita.profesional_nombre || 'Sin profesional'}`,
        start: new Date(cita.fecha_hora),
        end: new Date(new Date(cita.fecha_hora).getTime() + 60 * 60 * 1000), // 1 hora después
        resource: cita,
    }));

    const eventStyleGetter = (event) => {
        const cita = event.resource;
        let backgroundColor = 'var(--primary)';

        switch (cita.estado) {
            case 'Realizada':
                backgroundColor = 'var(--success)';
                break;
            case 'Cancelada':
                backgroundColor = 'var(--danger)';
                break;
            case 'No Asistió':
                backgroundColor = 'var(--warning)';
                break;
            default:
                backgroundColor = 'var(--primary)';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    const handleSelectSlot = ({ start }) => {
        const isoString = moment(start).format('YYYY-MM-DDTHH:mm');
        setFormData({ ...formData, fecha_hora: isoString });
        setShowModal(true);
    };

    const handleSelectEvent = (event) => {
        const cita = event.resource;
        const confirmAction = window.confirm(
            `Cita: ${event.title}\nFecha: ${moment(cita.fecha_hora).format('DD/MM/YYYY HH:mm')}\nEstado: ${cita.estado}\n\n¿Desea eliminar esta cita?`
        );
        if (confirmAction) {
            handleDelete(cita.id_cita);
        }
    };

    const formatDateTime = (datetime) => {
        return moment(datetime).format('DD/MM/YYYY HH:mm');
    };

    const getEstadoBadge = (estado) => {
        const badges = {
            'Agendada': 'badge-info',
            'Realizada': 'badge-success',
            'Cancelada': 'badge-danger',
            'No Asistió': 'badge-warning',
        };
        return badges[estado] || 'badge-info';
    };

    const messages = {
        allDay: 'Todo el día',
        previous: 'Anterior',
        next: 'Siguiente',
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        agenda: 'Agenda',
        date: 'Fecha',
        time: 'Hora',
        event: 'Cita',
        noEventsInRange: 'No hay citas en este rango',
        showMore: total => `+ Ver más (${total})`
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Calendario de Citas</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setViewMode('calendar')}
                    >
                        <CalendarIcon size={18} /> Calendario
                    </button>
                    <button
                        className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setViewMode('list')}
                    >
                        <List size={18} /> Lista
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Nueva Cita
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando...</div>
            ) : viewMode === 'calendar' ? (
                <div className="glass" style={{ padding: '1rem', height: '600px' }}>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        eventPropGetter={eventStyleGetter}
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        selectable
                        messages={messages}
                        views={['month', 'week', 'day', 'agenda']}
                        defaultView="week"
                    />
                </div>
            ) : (
                <div className="glass" style={{ padding: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha/Hora</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Paciente</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Profesional</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Especialidad</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Estado</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Modalidad</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {citas.map((cita) => (
                                <tr key={cita.id_cita} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>{formatDateTime(cita.fecha_hora)}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {cita.cliente_nombres} {cita.cliente_apellido}
                                    </td>
                                    <td style={{ padding: '1rem' }}>{cita.profesional_nombre || 'Sin nombre'}</td>
                                    <td style={{ padding: '1rem' }}>{cita.especialidad}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <select
                                            value={cita.estado}
                                            onChange={(e) => handleChangeEstado(cita.id_cita, e.target.value)}
                                            className={`badge ${getEstadoBadge(cita.estado)}`}
                                            style={{ border: 'none', cursor: 'pointer' }}
                                        >
                                            <option value="Agendada">Agendada</option>
                                            <option value="Realizada">Realizada</option>
                                            <option value="Cancelada">Cancelada</option>
                                            <option value="No Asistió">No Asistió</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className="badge badge-secondary">{cita.modalidad}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            className="btn btn-ghost"
                                            style={{ padding: '0.5rem' }}
                                            onClick={() => handleDelete(cita.id_cita)}
                                        >
                                            ❌
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {citas.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No se encontraron citas
                        </div>
                    )}
                </div>
            )}

            {/* Modal Crear Cita */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="glass" style={{ padding: '2rem', maxWidth: '500px', width: '90%' }}>
                        < h2>Nueva Cita</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Cliente</label>
                                <select
                                    value={formData.rut_cliente}
                                    onChange={(e) => setFormData({ ...formData, rut_cliente: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                >
                                    <option value="">Seleccione un paciente</option>
                                    {clientes.map(c => (
                                        <option key={c.rut_cliente} value={c.rut_cliente}>
                                            {c.nombres} {c.ap_paterno} ({c.rut_cliente})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Profesional</label>
                                <select
                                    value={formData.rut_prof}
                                    onChange={(e) => setFormData({ ...formData, rut_prof: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                >
                                    <option value="">Seleccione un profesional</option>
                                    {profesionales.map(p => (
                                        <option key={p.rut_prof} value={p.rut_prof}>
                                            {p.nombre_completo || p.rut_prof} - {p.especialidad}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Fecha y Hora</label>
                                <input
                                    type="datetime-local"
                                    value={formData.fecha_hora}
                                    onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Modalidad</label>
                                <select
                                    value={formData.modalidad}
                                    onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                >
                                    <option value="Presencial">Presencial</option>
                                    <option value="Online">Online</option>
                                    <option value="Domicilio">Domicilio</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Crear Cita
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
