import { io } from 'socket.io-client'; 
let socket = null; export function obtenirSocket() { 
    if (!socket) { 
        const token = localStorage.getItem('token'); 
        const URL_SERVEUR = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'; socket = io(URL_SERVEUR, { auth: { token } }); 
    } 
    return socket; 
}