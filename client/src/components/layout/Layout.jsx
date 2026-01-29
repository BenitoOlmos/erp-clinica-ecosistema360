import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, X, Home, Calendar, Users, Briefcase, Stethoscope, Package, UserCog, DollarSign } from 'lucide-react';

export const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const getRoleBadge = (rol) => {
        const badges = {
            admin: '👑 Admin',
            coordinador: '📋 Coord.',
            profesional: '👨‍⚕️ Prof.',
            contador: '💰 Cont.'
        };
        return badges[rol] || rol;
    };

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/calendario', label: 'Calendario', icon: Calendar },
        { path: '/clientes', label: 'Pacientes', icon: Users },
        { path: '/profesionales', label: 'Profesionales', icon: Stethoscope },
        { path: '/servicios', label: 'Servicios', icon: Briefcase },
        { path: '/programas', label: 'Programas', icon: Package },
        // { path: '/usuarios', label: 'Usuarios', icon: UserCog }, // Placeholder for now
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
            {/* Mobile Header */}
            <header className="mobile-header glass" style={{
                padding: '1rem', display: 'none', justifyContent: 'space-between', alignItems: 'center',
                position: 'sticky', top: 0, zIndex: 1000
            }}>
                <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.2rem' }}>EQUILIBRAR</h2>
                <button className="btn btn-ghost" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </header>

            <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
                {/* Sidebar - Desktop & Tablet */}
                <aside className={`glass sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{
                    width: '250px', margin: '1rem', padding: '1rem', display: 'flex', flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out'
                }}>
                    <h2 className="desktop-logo" style={{ marginBottom: '2rem', color: 'var(--primary)', textAlign: 'center' }}>EQUILIBRAR</h2>
                    <nav style={{ flex: 1 }}>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {menuItems.map(item => (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`btn btn-ghost ${location.pathname === item.path ? 'active' : ''}`}
                                        style={{
                                            width: '100%', justifyContent: 'flex-start', textDecoration: 'none',
                                            backgroundColor: location.pathname === item.path ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                                            color: location.pathname === item.path ? 'var(--primary)' : 'inherit',
                                            gap: '0.75rem'
                                        }}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <item.icon size={20} />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                            {/* Finance/Users separate or same logic */}
                            <li><button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem' }}><DollarSign size={20} /> Finanzas</button></li>
                        </ul>
                    </nav>

                    {/* User Info Bottom Sidebar */}
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.nombre_completo || user?.username}</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{getRoleBadge(user?.rol)}</p>
                            </div>
                            <button onClick={logout} className="btn btn-ghost" style={{ padding: '0.25rem', color: 'red' }} title="Salir"><LogOut size={18} /></button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main style={{ flex: 1, padding: '1rem', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    {/* Desktop Header (simplified mainly for breadcrumbs or actions, user info moved to sidebar) */}
                    <header className="desktop-header glass" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </header>

                    <div className="glass" style={{ minHeight: '80vh', padding: '1.5rem', borderRadius: '1rem' }}>
                        <Outlet />
                    </div>
                </main>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .mobile-header { display: flex !important; }
                    .desktop-logo, .desktop-header { display: none !important; }
                    .sidebar {
                        position: fixed;
                        top: 60px; left: 0; bottom: 0;
                        z-index: 999;
                        margin: 0 !important;
                        border-radius: 0;
                        width: 100% !important;
                        transform: translateX(-100%);
                        background: var(--surface); /* Ensure opaque background on mobile */
                        backdrop-filter: blur(20px);
                    }
                    .sidebar.open {
                        transform: translateX(0);
                    }
                    main { padding: 0.5rem !important; }
                }
            `}</style>
        </div>
    );
};
