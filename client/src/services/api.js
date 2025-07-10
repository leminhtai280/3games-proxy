import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  getBalance: () => api.get('/users/balance'),
};

// Payment API
export const paymentAPI = {
  createPayment: (data) => api.post('/payments/create', data),
  getMyPayments: (page = 1, limit = 10) => 
    api.get(`/payments/my-payments?page=${page}&limit=${limit}`),
  getPayment: (id) => api.get(`/payments/${id}`),
  uploadProof: (id, proofImage) => 
    api.put(`/payments/${id}/upload-proof`, { proofImage }),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (page = 1, limit = 10, search = '', status = '') => 
    api.get(`/admin/users?page=${page}&limit=${limit}&search=${search}&status=${status}`),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getPayments: (page = 1, limit = 10, status = '', method = '') => 
    api.get(`/admin/payments?page=${page}&limit=${limit}&status=${status}&method=${method}`),
  getPayment: (id) => api.get(`/admin/payments/${id}`),
  processPayment: (id, data) => api.put(`/payments/${id}/process`, data),
};

export default api;