import { io } from 'socket.io-client'; 
let socket = null; export function obtenirSocket() { 
    if (!socket) { 
        const token = localStorage.getItem('token'); 
        socket = io(import.meta.env.VITE_API_URL.replace('api', 'socket'), { auth: { token } }); 
    } 
    return socket; 
}