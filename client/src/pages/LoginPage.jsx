import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(credentials.username, credentials.password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    const fillDemo = (username) => {
        const demoCredentials = {
            admin: { username: 'admin', password: 'admin123' },
            coordinador: { username: 'coordinador', password: 'coord123' },
            doctor: { username: 'doctor', password: 'doctor123' },
            contador: { username: 'contador', password: 'conta123' }
        };

        setCredentials(demoCredentials[username]);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="card" style={{
                maxWidth: '450px',
                width: '100%',
                padding: '3rem',
                position: 'relative'
            }}>
                {/* Logo y Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                        borderRadius: '50%',
                        margin: '0 auto 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(0, 130, 173, 0.3)'
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                            <path d="M2 17L12 22L22 17" />
                            <path d="M2 12L12 17L22 12" />
                        </svg>
                    </div>
                    <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                        EQUILIBRAR
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        Centro Clínico - Sistema ERP
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            padding: '0.75rem 1rem',
                            background: 'rgba(220, 53, 69, 0.1)',
                            border: '1px solid var(--danger)',
                            borderRadius: 'var(--radius-sm)',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--danger)'
                        }}>
                            <AlertCircle size={18} />
                            <span style={{ fontSize: '0.875rem' }}>{error}</span>
                        </div>
                    )}

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: 'var(--text-main)'
                        }}>
                            Usuario
                        </label>
                        <input
                            type="text"
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            placeholder="Ingrese su usuario"
                            required
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'var(--background)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-main)',
                                fontSize: '0.95rem',
                                transition: 'var(--transition)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: 'var(--text-main)'
                        }}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            placeholder="••••••••"
                            required
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'var(--background)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-main)',
                                fontSize: '0.95rem',
                                transition: 'var(--transition)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', marginBottom: '1.5rem' }}
                    >
                        {loading ? (
                            'Iniciando sesión...'
                        ) : (
                            <>
                                <LogIn size={18} />
                                Iniciar Sesión
                            </>
                        )}
                    </button>
                </form>

                {/* Usuarios Demo */}
                <div style={{
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--border)'
                }}>
                    <p style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textAlign: 'center',
                        marginBottom: '1rem'
                    }}>
                        Usuarios Demo (Click para llenar)
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem'
                    }}>
                        <button
                            type="button"
                            onClick={() => fillDemo('admin')}
                            className="btn btn-ghost"
                            style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                        >
                            👑 Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemo('coordinador')}
                            className="btn btn-ghost"
                            style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                        >
                            📋 Coordinador
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemo('doctor')}
                            className="btn btn-ghost"
                            style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                        >
                            👨‍⚕️ Doctor
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemo('contador')}
                            className="btn btn-ghost"
                            style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                        >
                            💰 Contador
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
