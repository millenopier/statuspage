import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email, password) => 
  api.post('/auth/login', { email, password });

// Services
export const getServices = () => api.get('/public/services');
export const createService = (data) => api.post('/admin/services', data);
export const updateService = (id, data) => api.put(`/admin/services/${id}`, data);
export const deleteService = (id) => api.delete(`/admin/services/${id}`);

// Incidents
export const getIncidents = () => api.get('/public/incidents');
export const createIncident = (data) => api.post('/admin/incidents', data);
export const updateIncident = (id, data) => api.put(`/admin/incidents/${id}`, data);
export const deleteIncident = (id) => api.delete(`/admin/incidents/${id}`);
export const addIncidentUpdate = (id, data) => api.post(`/admin/incidents/${id}/updates`, data);

// Maintenances
export const getMaintenances = () => api.get('/public/maintenances');
export const createMaintenance = (data) => api.post('/admin/maintenances', data);
export const updateMaintenance = (id, data) => api.put(`/admin/maintenances/${id}`, data);
export const deleteMaintenance = (id) => api.delete(`/admin/maintenances/${id}`);

// Subscribers
export const getSubscribers = () => api.get('/admin/subscribers');
export const deleteSubscriber = (id) => api.delete(`/admin/subscribers/${id}`);
