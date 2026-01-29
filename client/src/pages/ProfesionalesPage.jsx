import React, { useState, useEffect } from 'react';
import { profesionalesService } from '../services/api';
import { Search, Plus, Edit, Trash2, User, UserCheck } from 'lucide-react';

export const ProfesionalesPage = () => {
    const [profesionales, setProfesionales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        rut_prof: '',
        nombres: '',
        ap_paterno: '',
        ap_materno: '',
        especialidad: '',
        tipo_contrato: 'Contratado',
        valor_hora_base: '',
        registro_sis: '',
        email: '',
        telefono: '',
        direccion: '',
        comuna: '',
        color: '#3b82f6',
        foto: null,
        activo: true
    });

    useEffect(() => {
        fetchProfesionales();
    }, []);

    const fetchProfesionales = async () => {
        try {
            const response = await profesionalesService.getAll();
            setProfesionales(response.data);
        } catch (error) {
            console.error('Error fetching profesionales:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            rut_prof: '',
            nombres: '',
            ap_paterno: '',
            ap_materno: '',
            especialidad: '',
            tipo_contrato: 'Contratado',
            valor_hora_base: '',
            registro_sis: '',
            email: '',
            telefono: '',
            direccion: '',
            comuna: '',
            color: '#3b82f6',
            foto: null,
            activo: true
        });
        setIsEditing(false);
        setShowModal(false);
    };

    const handleEdit = (prof) => {
        setFormData({
            rut_prof: prof.rut_prof,
            nombres: prof.nombres || '',
            ap_paterno: prof.ap_paterno || '',
            ap_materno: prof.ap_materno || '',
            especialidad: prof.especialidad || '',
            tipo_contrato: prof.tipo_contrato || 'Contratado',
            valor_hora_base: prof.valor_hora_base || '',
            registro_sis: prof.registro_sis || '',
            email: prof.email || '',
            telefono: prof.telefono || '',
            direccion: prof.direccion || '',
            comuna: prof.comuna || '',
            color: prof.color || '#3b82f6',
            foto: null, // Reset foto on edit unless we want to show preview (omitted for brevity)
            activo: prof.activo !== 0 && prof.activo !== false // Default true if loose comparison holds, check specifically for 0/false from DB
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'foto' && formData[key]) {
                    data.append('foto', formData[key]);
                } else if (key === 'activo') {
                    data.append('activo', formData[key] ? 1 : 0);
                } else if (formData[key] !== null && formData[key] !== undefined && key !== 'foto') {
                    data.append(key, formData[key]);
                }
            });

            if (isEditing) {
                await profesionalesService.update(formData.rut_prof, data);
                alert('✅ Profesional actualizado exitosamente');
            } else {
                await profesionalesService.create(data);
                alert('✅ Profesional creado exitosamente');
            }
            setShowModal(false);
            resetForm();
            fetchProfesionales();
        } catch (error) {
            console.error('Error saving profesional:', error);
            alert(error.response?.data?.message || 'Error al guardar profesional');
        }
    };

    const handleDelete = async (rut) => {
        if (!window.confirm('¿Está seguro de eliminar este profesional?')) return;

        try {
            await profesionalesService.delete(rut);
            fetchProfesionales();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al eliminar profesional');
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(value);
    };

    const getContractBadge = (tipo) => {
        const badges = {
            'Contratado': 'badge-success',
            'Honorarios': 'badge-info',
            'Mixto': 'badge-warning'
        };
        return badges[tipo] || 'badge-info';
    };

    const filteredProfesionales = profesionales.filter(p =>
        p.rut_prof.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.nombre_completo && p.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Gestión de Profesionales</h1>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={18} /> Nuevo Profesional
                </button>
            </div>

            <div className="glass" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Buscar por RUT, nombre o especialidad..."
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
                                <th style={{ padding: '1rem', textAlign: 'left' }}>RUT</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Nombre Completo</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Especialidad</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Teléfono</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Correo</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Valor Hora</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Estado</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProfesionales.map((prof) => (
                                <tr key={prof.rut_prof} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem' }}>{prof.rut_prof}</td>
                                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            backgroundColor: prof.color || '#ccc',
                                            backgroundImage: prof.url_foto ? `url(http://localhost:3000${prof.url_foto})` : 'none',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontWeight: 'bold', fontSize: '0.8rem',
                                            border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}>
                                            {!prof.url_foto && (prof.nombres ? prof.nombres[0] : 'P')}
                                        </div>
                                        {`${prof.nombres} ${prof.ap_paterno} ${prof.ap_materno || ''}`}
                                    </td>
                                    <td style={{ padding: '1rem' }}>{prof.especialidad}</td>
                                    <td style={{ padding: '1rem' }}>{prof.telefono}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{prof.email}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                        {formatCurrency(prof.valor_hora_base)}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${prof.activo ? 'badge-success' : 'badge-danger'}`} style={{ opacity: 0.8 }}>
                                            {prof.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => handleEdit(prof)}>
                                            <Edit size={16} />
                                        </button>
                                        <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => handleDelete(prof.rut_prof)}>
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
                    <div className="glass" style={{ padding: '2rem', maxWidth: '600px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2>{isEditing ? 'Editar Profesional' : 'Nuevo Profesional'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>RUT Profesional</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 11.111.111-1"
                                        value={formData.rut_prof}
                                        onChange={(e) => setFormData({ ...formData, rut_prof: e.target.value })}
                                        required
                                        disabled={isEditing}
                                        style={{
                                            width: '100%', padding: '0.75rem', background: isEditing ? 'rgba(0,0,0,0.1)' : 'var(--surface)',
                                            border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nombres</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Juan Andrés"
                                        value={formData.nombres}
                                        onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Apellido Paterno</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Pérez"
                                        value={formData.ap_paterno}
                                        onChange={(e) => setFormData({ ...formData, ap_paterno: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Apellido Materno</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Soto"
                                        value={formData.ap_materno}
                                        onChange={(e) => setFormData({ ...formData, ap_materno: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Especialidad</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Psicólogo Clínico"
                                        value={formData.especialidad}
                                        onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Teléfono</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: +569 1234 5678"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Correo</label>
                                    <input
                                        type="email"
                                        placeholder="Ej: juan.perez@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Dirección</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Av. Providencia 123"
                                        value={formData.direccion}
                                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Comuna</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Providencia"
                                        value={formData.comuna}
                                        onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Valor Hora Base</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 25000 (sin puntos)"
                                        value={formData.valor_hora_base}
                                        onChange={(e) => setFormData({ ...formData, valor_hora_base: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                    <small style={{ color: 'var(--text-muted)' }}>Se visualizará como: {formatCurrency(formData.valor_hora_base || 0)}</small>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tipo Contrato</label>
                                    <select
                                        value={formData.tipo_contrato}
                                        onChange={(e) => setFormData({ ...formData, tipo_contrato: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    >
                                        <option value="Contratado">Contratado</option>
                                        <option value="Honorarios">Honorarios</option>
                                        <option value="Mixto">Mixto</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Registro SIS (Opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 54321"
                                        value={formData.registro_sis}
                                        onChange={(e) => setFormData({ ...formData, registro_sis: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Color Identificador</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            style={{ width: '50px', height: '40px', padding: '0', border: 'none', background: 'none', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{formData.color}</span>
                                    </div>
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Foto de Perfil</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFormData({ ...formData, foto: e.target.files[0] })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        id="activoProf"
                                        checked={formData.activo}
                                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="activoProf" style={{ cursor: 'pointer', fontSize: '0.95rem' }}>Profesional Activo</label>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-ghost" onClick={resetForm}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? 'Actualizar' : 'Crear Profesional'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
