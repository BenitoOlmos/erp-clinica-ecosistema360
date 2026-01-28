import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            const isLoginPage = window.location.pathname === '/login';

            if (!isLoginPage) {
                // Limpiar sesión
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];

                // Redirigir a login
                window.location.href = '/login';

                // Mostrar mensaje opcional
                console.warn('Sesión expirada. Por favor inicie sesión nuevamente.');
            }
        }
        return Promise.reject(error);
    }
);

// Servicios de API
export const clientesService = {
    getAll: () => api.get('/clientes'),
    getByRut: (rut) => api.get(`/clientes/${rut}`),
    create: (data) => api.post('/clientes', data),
    update: (rut, data) => api.put(`/clientes/${rut}`, data),
    delete: (rut) => api.delete(`/clientes/${rut}`),
};

export const profesionalesService = {
    getAll: () => api.get('/profesionales'),
    getByRut: (rut) => api.get(`/profesionales/${rut}`),
    getUsuarioVinculado: (rut) => api.get(`/profesionales/${rut}/usuario`),
    create: (data) => api.post('/profesionales', data),
    update: (rut, data) => api.put(`/profesionales/${rut}`, data),
    delete: (rut) => api.delete(`/profesionales/${rut}`),
};

export const citasService = {
    getAll: (params) => api.get('/citas', { params }),
    getById: (id) => api.get(`/citas/${id}`),
    getByProfesional: (rut) => api.get(`/citas/profesional/${rut}`),
    getByCliente: (rut) => api.get(`/citas/cliente/${rut}`),
    create: (data) => api.post('/citas', data),
    update: (id, data) => api.put(`/citas/${id}`, data),
    updateEstado: (id, estado) => api.put(`/citas/${id}/estado`, { estado }),
    delete: (id) => api.delete(`/citas/${id}`),
};

export const authService = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    me: () => api.get('/auth/me'),
    logout: () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;
