import React, { useState, useEffect } from 'react';
import { programasService, serviciosService, profesionalesService, clientesService } from '../services/api';
import { Plus, Trash, Search, Package, Check } from 'lucide-react';

export const ProgramasPage = () => {
    const [programas, setProgramas] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [profesionales, setProfesionales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Assign Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [currentProgramToAssign, setCurrentProgramToAssign] = useState(null);
    const [assignData, setAssignData] = useState({ rut_cliente: '', clientName: '', pagado: false });

    // Form State
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: 0,
        servicios: [] // { id_servicio, cantidad, rut_prof(optional) }
    });

    // Helper for adding service to program
    const [selectedService, setSelectedService] = useState('');
    const [selectedQty, setSelectedQty] = useState(1);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [progRes, servRes, profRes] = await Promise.all([
                programasService.getAll(),
                serviciosService.getAll(),
                profesionalesService.getAll()
            ]);
            setProgramas(progRes.data);
            setServicios(servRes.data.filter(s => s.activo));
            setProfesionales(profRes.data.filter(p => p.activo));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddService = () => {
        if (!selectedService) return;
        const s = servicios.find(ser => ser.id_servicio == selectedService);
        if (!s) return;

        setFormData({
            ...formData,
            servicios: [...formData.servicios, {
                id_servicio: s.id_servicio,
                nombre_servicio: s.nombre_servicio,
                cantidad: selectedQty
            }]
        });
        setSelectedService('');
        setSelectedQty(1);
    };

    const handleRemoveService = (index) => {
        const newServicios = [...formData.servicios];
        newServicios.splice(index, 1);
        setFormData({ ...formData, servicios: newServicios });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id_programa) {
                await programasService.update(formData.id_programa, formData);
                alert('Programa actualizado');
            } else {
                await programasService.create(formData);
                alert('Programa creado exitosamente');
            }
            setShowModal(false);
            setFormData({ nombre: '', descripcion: '', precio: 0, servicios: [] });
            loadData();
        } catch (error) {
            console.error(error);
            alert('Error al guardar programa');
        }
    };

    const handleEdit = (prog) => {
        setFormData({
            id_programa: prog.id_programa, // Important for update logic
            nombre: prog.nombre,
            descripcion: prog.descripcion,
            precio: prog.precio,
            servicios: prog.servicios.map(s => ({
                id_servicio: s.id_servicio,
                nombre_servicio: s.nombre_servicio,
                cantidad: s.cantidad,
                rut_prof: s.rut_prof
            }))
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro de eliminar este programa?')) {
            try {
                await programasService.delete(id);
                loadData();
            } catch (error) {
                alert('Error al eliminar');
            }
        }
    };

    // --- Assign Logic ---
    const openAssignModal = (prog) => {
        setCurrentProgramToAssign(prog);
        setAssignData({
            rut_cliente: '',
            clientName: '',
            pagado: false,
            medio_pago: '',
            fecha: new Date().toISOString().split('T')[0]
        });
        setShowAssignModal(true);
    };

    const handleClientSearch = async (term) => {
        // ... kept previous logic or empty ...
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if (!assignData.rut_cliente) return alert('Seleccione un cliente');
        if (assignData.pagado && !assignData.medio_pago) return alert('Seleccione un medio de pago');
        try {
            await programasService.assign({
                rut_cliente: assignData.rut_cliente,
                id_programa: currentProgramToAssign.id_programa,
                pagado: assignData.pagado,
                medio_pago: assignData.pagado ? assignData.medio_pago : null,
                fecha_compra: assignData.fecha
            });
            alert('Programa asignado correctamente');
            setShowAssignModal(false);
        } catch (error) {
            console.error(error);
            alert('Error al asignar');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Programas</h1>
                <button className="btn btn-primary" onClick={() => { setFormData({ nombre: '', descripcion: '', precio: 0, servicios: [] }); setShowModal(true); }}>
                    <Plus size={20} /> Nuevo Programa
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {programas.map(prog => (
                    <div key={prog.id_programa} className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{prog.nombre}</h3>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '0.25rem' }}>
                                    ${prog.precio.toLocaleString()}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-ghost" onClick={() => handleEdit(prog)} title="Editar">✏️</button>
                                <button className="btn btn-ghost" style={{ color: 'red' }} onClick={() => handleDelete(prog.id_programa)} title="Eliminar"><Trash size={16} /></button>
                            </div>
                        </div>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', flex: 1 }}>{prog.descripcion || 'Sin descripción'}</p>

                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>INCLUYE:</div>
                            {prog.servicios && prog.servicios.map((s, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                    <span>• {s.nombre_servicio}</span>
                                    <span style={{ fontWeight: 'bold' }}>x{s.cantidad}</span>
                                </div>
                            ))}
                        </div>

                        <button className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => openAssignModal(prog)}>
                            Vender / Asignar
                        </button>
                    </div>
                ))}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000,
                    padding: '1rem'
                }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', borderRadius: '1rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{formData.id_programa ? 'Editar Programa' : 'Crear Nuevo Programa'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre del Programa</label>
                                <input required type="text" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Descripción</label>
                                <textarea value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)', minHeight: '80px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Precio Total ($)</label>
                                <input required type="number" value={formData.precio} onChange={e => setFormData({ ...formData, precio: parseInt(e.target.value) })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }} />
                            </div>

                            <hr style={{ border: 0, borderTop: '1px solid var(--glass-border)', margin: '1rem 0' }} />

                            {/* Service Adder */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Servicios incluidos</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <select value={selectedService} onChange={e => setSelectedService(e.target.value)}
                                        style={{ flex: 1, padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}>
                                        <option value="">Seleccionar Servicio...</option>
                                        {servicios.map(s => <option key={s.id_servicio} value={s.id_servicio}>{s.nombre_servicio}</option>)}
                                    </select>
                                    <input type="number" min="1" value={selectedQty} onChange={e => setSelectedQty(parseInt(e.target.value))}
                                        style={{ width: '80px', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }} />
                                    <button type="button" className="btn btn-secondary" onClick={handleAddService}>Agregar</button>
                                </div>
                            </div>

                            {/* Services List */}
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius)', minHeight: '100px' }}>
                                {formData.servicios.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No hay servicios agregados</p> : (
                                    formData.servicios.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                            <span>{item.nombre_servicio} (x{item.cantidad})</span>
                                            <button type="button" className="btn btn-ghost" style={{ color: 'red', padding: '0.25rem' }} onClick={() => handleRemoveService(idx)}><Trash size={14} /></button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">{formData.id_programa ? 'Guardar Cambios' : 'Crear Programa'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {showAssignModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000,
                    padding: '1rem'
                }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: '1rem' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Vender / Asignar Programa</h2>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>{currentProgramToAssign?.nombre}</h3>

                        <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <AssignClientSearch assignData={assignData} setAssignData={setAssignData} />

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Fecha de Venta</label>
                                <input
                                    type="date"
                                    value={assignData.fecha}
                                    onChange={e => setAssignData({ ...assignData, fecha: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)', marginBottom: '1rem' }}
                                />
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={assignData.pagado} onChange={e => setAssignData({ ...assignData, pagado: e.target.checked })} />
                                Marcar como PAGADO
                            </label>

                            {assignData.pagado && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Medio de Pago</label>
                                    <select
                                        value={assignData.medio_pago || ''}
                                        onChange={e => setAssignData({ ...assignData, medio_pago: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Transferencia">Transferencia</option>
                                        <option value="Débito">Débito</option>
                                        <option value="Crédito">Crédito</option>
                                        <option value="Efectivo">Efectivo</option>
                                    </select>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowAssignModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Confirmar Asignación</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

const AssignClientSearch = ({ assignData, setAssignData }) => {
    const [term, setTerm] = useState('');
    const [results, setResults] = useState([]);

    // Using debounce or simple threshold for search
    const handleSearch = async (val) => {
        setTerm(val);
        if (val.length > 2) {
            try {
                const res = await clientesService.getAll();
                const filtered = res.data.filter(c =>
                    c.rut_cliente.toLowerCase().includes(val.toLowerCase()) ||
                    c.nombres.toLowerCase().includes(val.toLowerCase()) ||
                    c.ap_paterno.toLowerCase().includes(val.toLowerCase())
                );
                setResults(filtered);
            } catch (error) {
                console.error(error);
            }
        } else {
            setResults([]);
        }
    };

    const selectClient = (c) => {
        setAssignData({
            ...assignData,
            rut_cliente: c.rut_cliente,
            clientName: `${c.nombres} ${c.ap_paterno}`
        });
        setTerm('');
        setResults([]);
    };

    return (
        <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Buscar Paciente (RUT o Nombre)</label>
            {assignData.rut_cliente ? (
                <div style={{ padding: '0.75rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{assignData.clientName} ({assignData.rut_cliente})</span>
                    <button type="button" onClick={() => setAssignData({ ...assignData, rut_cliente: '', clientName: '' })} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                </div>
            ) : (
                <>
                    <input type="text" placeholder="Escribe para buscar..." value={term} onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                    />

                    {results.length > 0 && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            background: 'var(--card-bg)', border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius)', zIndex: 10, maxHeight: '150px', overflowY: 'auto',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                        }}>
                            {results.map(c => (
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
    );
};
