import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

export const Layout = () => {
    const { user, logout } = useAuth();

    const getRoleBadge = (rol) => {
        const badges = {
            admin: '👑 Administrador',
            coordinador: '📋 Coordinador',
            profesional: '👨‍⚕️ Profesional',
            contador: '💰 Contador'
        };
        return badges[rol] || rol;
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside className="glass" style={{ width: '250px', margin: '1rem', padding: '1rem' }}>
                <h2 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>EQUILIBRAR</h2>
                <nav>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li><Link to="/" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>Dashboard</Link></li>
                        <li><Link to="/clientes" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>Pacientes</Link></li>
                        <li><Link to="/profesionales" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>Profesionales</Link></li>
                        <li><Link to="/calendario" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>Calendario</Link></li>
                        <li><button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }}>Finanzas</button></li>
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '1rem' }}>
                <header className="glass" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>Bienvenido</h3>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {user?.nombre_completo || user?.username}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className="badge badge-info">
                            {getRoleBadge(user?.rol)}
                        </div>
                        <button
                            className="btn btn-ghost"
                            onClick={logout}
                            title="Cerrar sesión"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>
                <div className="glass" style={{ minHeight: '80vh', padding: '1rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
