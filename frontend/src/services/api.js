import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productApi = {
  createProduct: (data) => api.post('/products', data),
  getProducts: () => api.get('/products'),
  getProduct: (id) => api.get(`/products/${id}`),
  updateStatus: (id, status) => api.put(`/products/${id}/status`, { status }),
  getHistory: (id) => api.get(`/products/${id}/history`),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};