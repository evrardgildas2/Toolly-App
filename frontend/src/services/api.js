import axios from 'axios';

console.log('VITE_API_URL =', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Ajoute automatiquement le token JWT stocké après connexion


export default api;
