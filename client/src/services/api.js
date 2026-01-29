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
    create: (data) => {
        const isFormData = data instanceof FormData;
        return api.post('/profesionales', data, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
        });
    },
    update: (rut, data) => {
        const isFormData = data instanceof FormData;
        return api.put(`/profesionales/${rut}`, data, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
        });
    },
    delete: (rut) => api.delete(`/profesionales/${rut}`),
};

export const serviciosService = {
    getAll: () => api.get('/servicios'),
    getById: (id) => api.get(`/servicios/${id}`),
    create: (data) => api.post('/servicios', data),
    update: (id, data) => api.put(`/servicios/${id}`, data),
    delete: (id) => api.delete(`/servicios/${id}`),
};

export const citasService = {
    getAll: (params) => api.get('/citas', { params }), // params: { start, end, rut_prof }
    getById: (id) => api.get(`/citas/${id}`), // Placeholder if we add getById route later
    create: (data) => api.post('/citas', data),
    update: (id, data) => api.put(`/citas/${id}`, data),
    delete: (id) => api.delete(`/citas/${id}`),
};

export const programasService = {
    getAll: () => api.get('/programas'),
    create: (data) => api.post('/programas', data),
    update: (id, data) => api.put(`/programas/${id}`, data),
    delete: (id) => api.delete(`/programas/${id}`),
    assign: (data) => api.post('/programas/asignar', data)
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
