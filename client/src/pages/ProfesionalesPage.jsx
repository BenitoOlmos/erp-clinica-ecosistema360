import React, { useState, useEffect } from 'react';
import { profesionalesService } from '../services/api';
import { Search, Plus, Edit, Trash2, User, UserCheck } from 'lucide-react';

export const ProfesionalesPage = () => {
    const [profesionales, setProfesionales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        rut_prof: '',
        especialidad: '',
        tipo_contrato: 'Contratado',
        valor_hora_base: '',
        registro_sis: ''
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await profesionalesService.create(formData);
            setShowModal(false);
            fetchProfesionales();
            setFormData({
                rut_prof: '',
                especialidad: '',
                tipo_contrato: 'Contratado',
                valor_hora_base: '',
                registro_sis: ''
            });
        } catch (error) {
            console.error('Error creating profesional:', error);
            alert(error.response?.data?.message || 'Error al crear profesional');
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
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
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
                            background: 'var(--background)',
                            border: '1px solid var(--border)',
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
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>RUT</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Nombre</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Especialidad</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Contrato</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Valor Hora</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Usuario</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProfesionales.map((prof) => (
                                <tr key={prof.rut_prof} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>{prof.rut_prof}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {prof.nombre_completo || <span style={{ color: 'var(--text-muted)' }}>Sin usuario</span>}
                                    </td>
                                    <td style={{ padding: '1rem' }}>{prof.especialidad}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${getContractBadge(prof.tipo_contrato)}`}>
                                            {prof.tipo_contrato}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                        {formatCurrency(prof.valor_hora_base)}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {prof.id_usuario ? (
                                            <UserCheck size={18} color="var(--success)" title="Usuario vinculado" />
                                        ) : (
                                            <User size={18} color="var(--text-muted)" title="Sin usuario" />
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button className="btn btn-ghost" style={{ padding: '0.5rem' }}>
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className="btn btn-ghost"
                                            style={{ padding: '0.5rem' }}
                                            onClick={() => handleDelete(prof.rut_prof)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredProfesionales.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No se encontraron profesionales
                        </div>
                    )}
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
                    <div className="glass" style={{ padding: '2rem', maxWidth: '500px', width: '90%' }}>
                        <h2>Nuevo Profesional</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="RUT (ej: 12345678-9)"
                                value={formData.rut_prof}
                                onChange={(e) => setFormData({ ...formData, rut_prof: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                            />
                            <input
                                type="text"
                                placeholder="Especialidad"
                                value={formData.especialidad}
                                onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                            />
                            <select
                                value={formData.tipo_contrato}
                                onChange={(e) => setFormData({ ...formData, tipo_contrato: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                            >
                                <option value="Contratado">Contratado</option>
                                <option value="Honorarios">Honorarios</option>
                                <option value="Mixto">Mixto</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Valor Hora Base"
                                value={formData.valor_hora_base}
                                onChange={(e) => setFormData({ ...formData, valor_hora_base: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                            />
                            <input
                                type="text"
                                placeholder="Registro SIS (opcional)"
                                value={formData.registro_sis}
                                onChange={(e) => setFormData({ ...formData, registro_sis: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                            />
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Crear Profesional
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
