import { io } from 'socket.io-client'; 
let socket = null; export function obtenirSocket() { 
    if (!socket) { 
        const token = localStorage.getItem('token'); 
        socket = io('http://localhost:5000', { auth: { token } }); 
    } 
    return socket; 
}