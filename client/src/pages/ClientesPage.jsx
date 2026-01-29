import React, { useState, useEffect } from 'react';
import { clientesService } from '../services/api';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

export const ClientesPage = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        rut_cliente: '',
        nombres: '',
        ap_paterno: '',
        ap_materno: '',
        email: '',
        isapre: '',
        direccion: '',
        telefono: '',
        comuna: ''
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

    const resetForm = () => {
        setFormData({ rut_cliente: '', nombres: '', ap_paterno: '', ap_materno: '', email: '', isapre: '', direccion: '', telefono: '', comuna: '' });
        setIsEditing(false);
        setShowModal(false);
    };

    const handleEdit = (cliente) => {
        setFormData({
            rut_cliente: cliente.rut_cliente,
            nombres: cliente.nombres,
            ap_paterno: cliente.ap_paterno,
            ap_materno: cliente.ap_materno || '',
            email: cliente.email || '',
            isapre: cliente.isapre || '',
            direccion: cliente.direccion || '',
            telefono: cliente.telefono || '',
            comuna: cliente.comuna || ''
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación básica
        if (!formData.rut_cliente || !formData.nombres || !formData.ap_paterno) {
            alert('Por favor complete los campos obligatorios (RUT, Nombres, Apellido Paterno)');
            return;
        }

        try {
            if (isEditing) {
                await clientesService.update(formData.rut_cliente, formData);
                alert('✅ Paciente actualizado exitosamente');
            } else {
                await clientesService.create(formData);
                alert('✅ Paciente creado exitosamente');
            }
            resetForm();
            fetchClientes();
        } catch (error) {
            console.error('Error saving cliente:', error);
            const action = isEditing ? 'actualizar' : 'crear';
            alert(`❌ Error al ${action} paciente. Verifique los datos.`);
        }
    };

    const handleDelete = async (rut) => {
        if (window.confirm('¿Está seguro que desea eliminar este paciente? Esta acción no se puede deshacer.')) {
            try {
                await clientesService.delete(rut);
                alert('✅ Paciente eliminado exitosamente');
                fetchClientes();
            } catch (error) {
                console.error('Error deleting cliente:', error);
                alert('❌ Error al eliminar paciente. Puede que tenga citas asociadas.');
            }
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
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
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
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Teléfono</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Comuna</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Isapre</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClientes.map((cliente) => (
                                <tr key={cliente.rut_cliente} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem' }}>{cliente.rut_cliente}</td>
                                    <td style={{ padding: '1rem' }}>{`${cliente.nombres} ${cliente.ap_paterno}`}</td>
                                    <td style={{ padding: '1rem' }}>{cliente.telefono || '-'}</td>
                                    <td style={{ padding: '1rem' }}>{cliente.comuna || '-'}</td>
                                    <td style={{ padding: '1rem' }}>{cliente.isapre}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => handleEdit(cliente)}><Edit size={16} /></button>
                                        <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => handleDelete(cliente.rut_cliente)}><Trash2 size={16} /></button>
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
                        <h2>{isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>RUT Paciente</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 12.345.678-9"
                                        value={formData.rut_cliente}
                                        onChange={(e) => setFormData({ ...formData, rut_cliente: e.target.value })}
                                        required
                                        disabled={isEditing}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: isEditing ? 'rgba(0,0,0,0.1)' : 'var(--surface)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: 'var(--radius)',
                                            color: 'var(--text-main)',
                                            cursor: isEditing ? 'not-allowed' : 'text'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nombres</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: María José"
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
                                        placeholder="Ej: González"
                                        value={formData.ap_paterno}
                                        onChange={(e) => setFormData({ ...formData, ap_paterno: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Apellido Materno</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Tapia"
                                        value={formData.ap_materno}
                                        onChange={(e) => setFormData({ ...formData, ap_materno: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Teléfono</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: +569 8765 4321"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
                                    <input
                                        type="email"
                                        placeholder="Ej: maria.gonzalez@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Isapre / Previsión</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Fonasa / Banmédica"
                                        value={formData.isapre}
                                        onChange={(e) => setFormData({ ...formData, isapre: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Dirección</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Calle Los Alerces 456"
                                        value={formData.direccion}
                                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Comuna</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Santiago"
                                        value={formData.comuna}
                                        onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-ghost" onClick={resetForm}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? 'Actualizar' : 'Crear Paciente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
