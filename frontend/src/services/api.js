import axios from 'axios';

console.log('VITE_API_URL =', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Ajoute automatiquement le token JWT stocké après connexion
api.interceptors.request.use(
  (config) => {
    // On récupère le token dans le localStorage
    const token = localStorage.getItem('token'); 
    
    // Si le token existe, on l'ajoute dans les en-têtes
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;