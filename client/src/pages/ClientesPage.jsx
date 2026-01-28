import React, { useState, useEffect } from 'react';
import { clientesService } from '../services/api';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

export const ClientesPage = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        rut_cliente: '',
        nombres: '',
        ap_paterno: '',
        ap_materno: '',
        email: '',
        isapre: '',
        direccion: ''
    });

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        try {
            const response = await clientesService.getAll();
            setClientes(response.data);
        } catch (error) {
            console.error('Error fetching clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await clientesService.create(formData);
            setShowModal(false);
            fetchClientes();
            setFormData({ rut_cliente: '', nombres: '', ap_paterno: '', ap_materno: '', email: '', isapre: '', direccion: '' });
        } catch (error) {
            console.error('Error creating cliente:', error);
        }
    };

    const filteredClientes = clientes.filter(c =>
        c.rut_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nombres.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Gestión de Pacientes</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Nuevo Paciente
                </button>
            </div>

            <div className="glass" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Buscar por RUT o nombre..."
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
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Nombre</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Isapre</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClientes.map((cliente) => (
                                <tr key={cliente.rut_cliente} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem' }}>{cliente.rut_cliente}</td>
                                    <td style={{ padding: '1rem' }}>{`${cliente.nombres} ${cliente.ap_paterno}`}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{cliente.email}</td>
                                    <td style={{ padding: '1rem' }}>{cliente.isapre}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <button className="btn btn-ghost" style={{ padding: '0.5rem' }}><Edit size={16} /></button>
                                        <button className="btn btn-ghost" style={{ padding: '0.5rem' }}><Trash2 size={16} /></button>
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
                    <div className="glass" style={{ padding: '2rem', maxWidth: '500px', width: '90%' }}>
                        <h2>Nuevo Paciente</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="RUT (ej: 12345678-9)"
                                value={formData.rut_cliente}
                                onChange={(e) => setFormData({ ...formData, rut_cliente: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                            />
                            <input
                                type="text"
                                placeholder="Nombres"
                                value={formData.nombres}
                                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                            />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Apellido Paterno"
                                    value={formData.ap_paterno}
                                    onChange={(e) => setFormData({ ...formData, ap_paterno: e.target.value })}
                                    style={{ flex: 1, padding: '0.75rem', marginBottom: '1rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Apellido Materno"
                                    value={formData.ap_materno}
                                    onChange={(e) => setFormData({ ...formData, ap_materno: e.target.value })}
                                    style={{ flex: 1, padding: '0.75rem', marginBottom: '1rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                />
                            </div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                            />
                            <input
                                type="text"
                                placeholder="Isapre"
                                value={formData.isapre}
                                onChange={(e) => setFormData({ ...formData, isapre: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                            />
                            <input
                                type="text"
                                placeholder="Dirección"
                                value={formData.direccion}
                                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                            />
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Crear Paciente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
