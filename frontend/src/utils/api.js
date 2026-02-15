import axios from 'axios';

const isProduction = import.meta.env.MODE === 'production';
const API_URL = isProduction
    ? 'https://linkvault-backend-dlzj.onrender.com/api'
    : 'http://localhost:3000/api';

console.log('🚀 API Config:', {
    mode: import.meta.env.MODE,
    isProduction,
    url: API_URL
});

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth API calls
export const register = async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
};

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const logout = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const getMyLinks = async () => {
    const response = await api.get('/my-links');
    return response.data;
};

export const claimLinks = async (linkIds) => {
    const response = await api.put('/my-links/claim', { linkIds });
    return response.data;
};

// Existing API calls (update to use api instance)
export const uploadContent = async (formData) => {
    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getContent = async (id, password = null) => {
    const url = password
        ? `/content/${id}?password=${encodeURIComponent(password)}`
        : `/content/${id}`;
    const response = await api.get(url);
    return response.data;
};

export const deleteContent = async (id) => {
    const response = await api.delete(`/delete/${id}`);
    return response.data;
};

export default api;
