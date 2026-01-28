import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Configurar axios con token
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        try {
            const response = await authService.getCurrentUser(); // Use authService
            setUser(response.data);
        } catch (error) {
            console.error('Error cargando usuario:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const { token, user } = await authService.login(username, password); // Use authService

            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);
            // authService.setAuthToken(token); // authService.login should handle this internally

            return { success: true };
        } catch (error) {
            console.error('Login Error Details:', error);

            let message = 'Error al iniciar sesión';
            if (error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error.message === 'Network Error') {
                message = 'Error de conexión: El servidor no responde en puerto 3000';
            } else {
                message = error.message;
            }

            return {
                success: false,
                message
            };
        }
    };

    const logout = () => {
        authService.logout(); // Use authService to clear token and headers
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
