import React, { useState, useEffect } from 'react';
import { citasService, profesionalesService, serviciosService, clientesService } from '../services/api';
import { Plus, ChevronLeft, ChevronRight, Search, Clock } from 'lucide-react';

export const CalendarioPage = () => {
    const [citas, setCitas] = useState([]);
    const [profesionales, setProfesionales] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);

    // View State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // 'day', 'week'

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [formData, setFormData] = useState({
        id_cita: null,
        rut_cliente: '',
        clientName: '',
        rut_prof: '',
        id_servicio: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '09:00',
        modalidad: 'Presencial',
        estado: 'Programada',
        monto: 0,
        tipo_pago: '',
        programa: '',
        estado_pago: 'Pendiente'
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchCitas();
    }, [currentDate, viewMode]);

    const fetchInitialData = async () => {
        try {
            const [usersRes, servRes] = await Promise.all([
                profesionalesService.getAll(),
                serviciosService.getAll()
            ]);
            setProfesionales(usersRes.data.filter(p => p.activo));
            setServicios(servRes.data.filter(s => s.activo));
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const fetchCitas = async () => {
        setLoading(true);
        try {
            const response = await citasService.getAll();
            setCitas(response.data);
        } catch (error) {
            console.error('Error fetching citas:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Search Clients ---
    const handleClientSearch = async (term) => {
        setClientSearchTerm(term);
        if (term.length > 2) {
            try {
                const res = await clientesService.getAll();
                const filtered = res.data.filter(c =>
                    c.rut_cliente.toLowerCase().includes(term.toLowerCase()) ||
                    c.nombres.toLowerCase().includes(term.toLowerCase()) ||
                    c.ap_paterno.toLowerCase().includes(term.toLowerCase())
                );
                setSearchResults(filtered);
            } catch (error) {
                console.error('search error', error);
            }
        } else {
            setSearchResults([]);
        }
    };

    const selectClient = (client) => {
        setFormData({
            ...formData,
            rut_cliente: client.rut_cliente,
            clientName: `${client.nombres} ${client.ap_paterno}`
        });
        setClientSearchTerm('');
        setSearchResults([]);
    };

    // --- Form Handlers ---
    const resetForm = () => {
        setFormData({
            id_cita: null,
            rut_cliente: '',
            clientName: '',
            rut_prof: profesionales.length > 0 ? profesionales[0].rut_prof : '',
            id_servicio: servicios.length > 0 ? servicios[0].id_servicio : '',
            fecha: new Date().toISOString().split('T')[0],
            hora: '09:00',
            modalidad: 'Presencial',
            estado: 'Programada',
            monto: servicios.length > 0 ? servicios[0].monto || 0 : 0,
            tipo_pago: '',
            programa: '',
            estado_pago: 'Pendiente'
        });
        setIsEditing(false);
        setClientSearchTerm('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await citasService.update(formData.id_cita, formData);
                alert('Cita actualizada');
            } else {
                await citasService.create(formData);
                alert('Cita agendada');
            }
            setShowModal(false);
            fetchCitas();
        } catch (error) {
            alert('Error al guardar cita');
        }
    };

    // --- View Helpers ---
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 to 20
    const [selectedProfs, setSelectedProfs] = useState([]);

    useEffect(() => {
        if (profesionales.length > 0 && selectedProfs.length === 0) {
            setSelectedProfs(profesionales.map(p => p.rut_prof));
        }
    }, [profesionales]);

    const toggleProfSelection = (rut) => {
        if (selectedProfs.includes(rut)) {
            setSelectedProfs(selectedProfs.filter(id => id !== rut));
        } else {
            setSelectedProfs([...selectedProfs, rut]);
        }
    };

    const isSameDay = (d1, d2) => {
        const date1 = new Date(d1);
        const date2 = new Date(d2);
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    };

    const getWeekDays = (baseDate) => {
        const week = [];
        const start = new Date(baseDate);
        const day = start.getDay() || 7;
        if (day !== 1) start.setHours(-24 * (day - 1));

        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            week.push(d);
        }
        return week;
    };

    const isMobile = window.innerWidth < 768;
    const daysToShow = viewMode === 'week' ? getWeekDays(currentDate) : [currentDate];
    const gridCols = viewMode === 'week' ? 7 : 1;
    const filteredCitas = citas.filter(c => selectedProfs.includes(c.rut_prof));

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Toolbar */}
            <div className="glass" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => setCurrentDate(d => new Date(d.setDate(d.getDate() - (viewMode === 'week' ? 7 : 1))))}><ChevronLeft size={20} /></button>
                        <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => setCurrentDate(d => new Date(d.setDate(d.getDate() + (viewMode === 'week' ? 7 : 1))))}><ChevronRight size={20} /></button>
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', textTransform: 'capitalize' }}>
                        {viewMode === 'week'
                            ? `Semana del ${daysToShow[0]?.getDate()} de ${daysToShow[0]?.toLocaleDateString('es-CL', { month: 'long' })}`
                            : currentDate.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
                        }
                    </h2>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '0.2rem' }}>
                        <button className={`btn ${viewMode === 'day' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setViewMode('day')}>Día</button>
                        <button className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setViewMode('week')}>Semana</button>
                    </div>
                    <button className="btn btn-primary" onClick={resetForm}>
                        <Plus size={18} /> <span style={{ display: isMobile ? 'none' : 'inline' }}>Nueva Cita</span>
                    </button>
                </div>
            </div>

            {/* Professionals Filter Bar */}
            <div className="glass" style={{ padding: '0.5rem 1rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', overflowX: 'auto', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Filtrar:</span>
                <button
                    className="btn btn-ghost"
                    style={{
                        padding: '0.25rem 0.75rem', fontSize: '0.8rem',
                        background: selectedProfs.length === profesionales.length ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                        color: selectedProfs.length === profesionales.length ? 'white' : 'inherit'
                    }}
                    onClick={() => setSelectedProfs(profesionales.map(p => p.rut_prof))}
                >
                    Todos
                </button>
                {profesionales.map(prof => (
                    <button
                        key={prof.rut_prof}
                        onClick={() => toggleProfSelection(prof.rut_prof)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.25rem 0.75rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
                            fontSize: '0.8rem',
                            background: selectedProfs.includes(prof.rut_prof) ? prof.color + '33' : 'rgba(255,255,255,0.05)',
                            border: selectedProfs.includes(prof.rut_prof) ? `1px solid ${prof.color}` : '1px solid transparent',
                            color: 'var(--text-main)',
                            opacity: selectedProfs.includes(prof.rut_prof) ? 1 : 0.6
                        }}
                    >
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: prof.color }} />
                        {prof.nombres.split(' ')[0]}
                    </button>
                ))}
            </div>

            {/* Main Calendar Grid */}
            <div className="glass" style={{ flex: 1, overflow: 'auto', position: 'relative', display: 'flex' }}>

                {/* Time Axis (Left Sidebar) */}
                <div style={{ width: '60px', flexShrink: 0, borderRight: '1px solid var(--glass-border)', background: 'var(--card-bg)', position: 'sticky', left: 0, zIndex: 10 }}>
                    <div style={{ height: '40px' }}></div>
                    {hours.map(h => (
                        <div key={h} style={{
                            height: '100px',
                            borderBottom: '1px solid var(--glass-border)',
                            fontSize: '0.75rem', color: 'var(--text-muted)',
                            padding: '0.5rem', textAlign: 'center'
                        }}>
                            {h}:00
                        </div>
                    ))}
                </div>

                {/* Grid Content */}
                <div style={{ flex: 1, minWidth: viewMode === 'week' ? '800px' : '300px' }}>

                    {/* Header Row (Days) */}
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)`, height: '40px', borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 9 }}>
                        {daysToShow.map((day, idx) => (
                            <div key={idx} style={{
                                padding: '0.5rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold',
                                borderRight: '1px solid var(--glass-border)',
                                color: isSameDay(day, new Date()) ? 'var(--primary)' : 'inherit'
                            }}>
                                {day.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' })}
                            </div>
                        ))}
                    </div>

                    {/* Body Rows (Time Slots) */}
                    <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
                        {daysToShow.map((day, dayIdx) => (
                            <div key={dayIdx} style={{ borderRight: '1px solid var(--glass-border)', position: 'relative' }}>
                                {/* Hour Cells */}
                                {hours.map(h => (
                                    <div key={h} style={{ height: '100px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}></div>
                                ))}

                                {/* Appointments Placement */}
                                {filteredCitas
                                    .filter(c => isSameDay(c.fecha, day))
                                    .map(cita => {
                                        const [h, m] = cita.hora.split(':').map(Number);
                                        if (h < 8 || h > 20) return null;

                                        const startMin = (h - 8) * 60 + m;
                                        const top = (startMin / 60) * 100;
                                        const height = (cita.duracion / 60) * 100;
                                        const prof = profesionales.find(p => p.rut_prof === cita.rut_prof);
                                        const bgColor = prof ? prof.color : '#ccc';

                                        return (
                                            <div
                                                key={cita.id_cita}
                                                onClick={() => { setFormData({ ...cita, clientName: cita.nombre_cliente + ' ' + cita.ap_cliente }); setIsEditing(true); setShowModal(true); }}
                                                style={{
                                                    position: 'absolute',
                                                    top: `${top}px`,
                                                    height: `${height}px`,
                                                    left: '2px', right: '2px',
                                                    backgroundColor: `${bgColor}cc`,
                                                    borderLeft: `4px solid ${bgColor}`,
                                                    borderRadius: '4px',
                                                    padding: '2px 4px',
                                                    fontSize: '0.75rem',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    zIndex: 1
                                                }}
                                                title={`${cita.hora} - ${cita.nombre_cliente}`}
                                            >
                                                <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>{cita.hora.substring(0, 5)}</span>
                                                    {height > 30 && <span style={{ opacity: 0.8 }}>{prof?.nombres?.[0]}{prof?.ap_paterno?.[0]}</span>}
                                                </div>
                                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {cita.nombre_cliente} {cita.ap_cliente}
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Nueva Cita */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000,
                    padding: '1rem'
                }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', borderRadius: '1rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{isEditing ? 'Editar Cita' : 'Nueva Cita'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            {/* Cliente Search */}
                            <div style={{ position: 'relative' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Paciente</label>
                                {formData.rut_cliente ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius)', border: '1px solid var(--primary)' }}>
                                        <span>{formData.clientName}</span>
                                        <button type="button" className="btn btn-ghost" onClick={() => setFormData({ ...formData, rut_cliente: '', clientName: '' })}>X</button>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Search size={18} style={{ color: 'var(--text-muted)' }} />
                                            <input
                                                type="text"
                                                placeholder="Buscar por nombre o RUT..."
                                                value={clientSearchTerm}
                                                onChange={(e) => handleClientSearch(e.target.value)}
                                                style={{ flex: 1, padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                            />
                                        </div>
                                        {searchResults.length > 0 && (
                                            <div style={{
                                                position: 'absolute', top: '100%', left: 0, right: 0,
                                                background: 'var(--card-bg)', border: '1px solid var(--glass-border)',
                                                borderRadius: 'var(--radius)', zIndex: 10, maxHeight: '150px', overflowY: 'auto'
                                            }}>
                                                {searchResults.map(c => (
                                                    <div key={c.rut_cliente}
                                                        onClick={() => selectClient(c)}
                                                        style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                                        className="hover-bg"
                                                    >
                                                        {c.nombres} {c.ap_paterno} ({c.rut_cliente})
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Profesional y Servicio */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Profesional</label>
                                    <select
                                        value={formData.rut_prof}
                                        onChange={(e) => setFormData({ ...formData, rut_prof: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    >
                                        {profesionales.map(p => (
                                            <option key={p.rut_prof} value={p.rut_prof}>{p.nombres} {p.ap_paterno}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Servicio</label>
                                    <select
                                        value={formData.id_servicio}
                                        onChange={(e) => setFormData({ ...formData, id_servicio: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    >
                                        {servicios.map(s => (
                                            <option key={s.id_servicio} value={s.id_servicio}>{s.nombre_servicio} ({s.tiempo}m)</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Fecha y Hora */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Fecha</label>
                                    <input type="date" value={formData.fecha} onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Hora</label>
                                    <input type="time" value={formData.hora} onChange={(e) => setFormData({ ...formData, hora: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }} />
                                </div>
                            </div>

                            {/* Modalidad y Estado */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Modalidad</label>
                                    <select value={formData.modalidad} onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}>
                                        <option value="Presencial">Presencial</option>
                                        <option value="Online">Online</option>
                                        <option value="Domicilio">Domicilio</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Estado</label>
                                    <select value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}>
                                        <option value="Programada">Programada</option>
                                        <option value="Confirmada">Confirmada</option>
                                        <option value="Realizada">Realizada</option>
                                        <option value="Cancelada">Cancelada</option>
                                        <option value="No asiste">No asiste</option>
                                        <option value="En espera">En espera</option>
                                    </select>
                                </div>
                            </div>

                            <hr style={{ border: '0', borderTop: '1px solid var(--glass-border)', margin: '0.5rem 0' }} />

                            {/* Pago */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Monto</label>
                                    <input type="number" value={formData.monto} onChange={(e) => setFormData({ ...formData, monto: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Estado Pago</label>
                                    <select value={formData.estado_pago} onChange={(e) => setFormData({ ...formData, estado_pago: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Pagado">Pagado</option>
                                    </select>
                                </div>
                            </div>

                            {/* Detalle Pago y Programa */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tipo Pago</label>
                                    <select value={formData.tipo_pago} onChange={(e) => setFormData({ ...formData, tipo_pago: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}>
                                        <option value="">Seleccionar...</option>
                                        <option value="Transferencia">Transferencia</option>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Debito">Débito</option>
                                        <option value="Credito">Crédito</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Programa (Opc)</label>
                                    <input type="text" placeholder="Ej: Fonasa" value={formData.programa} onChange={(e) => setFormData({ ...formData, programa: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar Cita</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
