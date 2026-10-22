import axios from 'axios';
import { viderSession } from './session';

console.log('VITE_API_URL =', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Ajoute automatiquement le token JWT stocké après connexion
api.interceptors.response.use(
  (reponse) => reponse,
  (erreur) => {
    const url = erreur.config?.url || '';
    const estRequeteAuth = url.includes('/auth/connexion') || url.includes('/auth/inscription');
    const dejaSurConnexion = window.location.pathname === '/connexion';

    if (erreur.response?.status === 401 && !estRequeteAuth && !dejaSurConnexion) {
      viderSession();
      window.location.href = '/connexion?session=expiree';
    }
    return Promise.reject(erreur);
  }
);

export default api;
