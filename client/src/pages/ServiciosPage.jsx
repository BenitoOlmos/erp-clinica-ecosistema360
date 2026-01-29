import React, { useState, useEffect } from 'react';
import { serviciosService } from '../services/api';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

export const ServiciosPage = () => {
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id_servicio: null,
        nombre_servicio: '',
        descripcion_corta: '',
        monto: '',
        tiempo: 30,
        tipo: 'Presencial',
        activo: true
    });

    useEffect(() => {
        fetchServicios();
    }, []);

    const fetchServicios = async () => {
        try {
            const response = await serviciosService.getAll();
            setServicios(response.data);
        } catch (error) {
            console.error('Error fetching servicios:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            id_servicio: null,
            nombre_servicio: '',
            descripcion_corta: '',
            monto: '',
            tiempo: 30,
            tipo: 'Presencial',
            activo: true
        });
        setIsEditing(false);
        setShowModal(false);
    };

    const handleEdit = (servicio) => {
        setFormData({
            id_servicio: servicio.id_servicio,
            nombre_servicio: servicio.nombre_servicio,
            descripcion_corta: servicio.descripcion_corta || '',
            monto: servicio.monto,
            tiempo: servicio.tiempo,
            tipo: servicio.tipo || 'Presencial',
            activo: servicio.activo !== 0 && servicio.activo !== false
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await serviciosService.update(formData.id_servicio, formData);
                alert('✅ Servicio actualizado exitosamente');
            } else {
                await serviciosService.create(formData);
                alert('✅ Servicio creado exitosamente');
            }
            setShowModal(false);
            resetForm();
            fetchServicios();
        } catch (error) {
            console.error('Error saving servicio:', error);
            alert(error.response?.data?.message || 'Error al guardar servicio');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este servicio?')) return;

        try {
            await serviciosService.delete(id);
            alert('✅ Servicio eliminado exitosamente');
            fetchServicios();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al eliminar servicio');
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(value);
    };

    const filteredServicios = servicios.filter(s =>
        s.nombre_servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.descripcion_corta && s.descripcion_corta.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Gestión de Servicios</h1>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={18} /> Nuevo Servicio
                </button>
            </div>

            <div className="glass" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Buscar servicio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            background: 'var(--surface)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius)',
                            color: 'var(--text-main)',
                            fontSize: '0.95rem'
                        }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando...</div>
            ) : (
                <div className="glass" style={{ padding: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Nombre</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Descripción</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Duración</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Tipo</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Monto</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Estado</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServicios.map((s) => (
                                <tr key={s.id_servicio} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{s.nombre_servicio}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{s.descripcion_corta}</td>
                                    <td style={{ padding: '1rem' }}>{s.tiempo} min</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '999px',
                                            fontSize: '0.8rem',
                                            background: s.tipo === 'Presencial' ? 'rgba(59, 130, 246, 0.2)' :
                                                s.tipo === 'Online' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                            color: s.tipo === 'Presencial' ? '#60a5fa' :
                                                s.tipo === 'Online' ? '#34d399' : '#fbbf24'
                                        }}>
                                            {s.tipo}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{formatCurrency(s.monto)}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${s.activo ? 'badge-success' : 'badge-danger'}`} style={{ opacity: 0.8 }}>
                                            {s.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => handleEdit(s)}>
                                            <Edit size={16} />
                                        </button>
                                        <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => handleDelete(s.id_servicio)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="glass" style={{ padding: '2rem', maxWidth: '600px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2>{isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nombre del Servicio</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Consulta General"
                                        value={formData.nombre_servicio}
                                        onChange={(e) => setFormData({ ...formData, nombre_servicio: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Descripción Corta</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Evaluación inicial de 30 min..."
                                        value={formData.descripcion_corta}
                                        onChange={(e) => setFormData({ ...formData, descripcion_corta: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Monto (CLP)</label>
                                    <input
                                        type="number"
                                        placeholder="Ej: 35000"
                                        value={formData.monto}
                                        onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Duración (min) via</label>
                                    <input
                                        type="number"
                                        placeholder="Ej: 30"
                                        value={formData.tiempo}
                                        onChange={(e) => setFormData({ ...formData, tiempo: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tipo de Atención</label>
                                    <select
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    >
                                        <option value="Presencial">Presencial</option>
                                        <option value="Online">Online</option>
                                        <option value="Domicilio">Domicilio</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        id="activoServ"
                                        checked={formData.activo}
                                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="activoServ" style={{ cursor: 'pointer', fontSize: '0.95rem' }}>Servicio Activo</label>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-ghost" onClick={resetForm}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? 'Actualizar' : 'Crear Servicio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
