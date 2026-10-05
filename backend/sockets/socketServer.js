const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

// Initialise Socket.io sur le serveur HTTP existant. À appeler une seule
// fois depuis server.js.
const initSocket = (serveurHttp) => {
  io = new Server(serveurHttp, {
    cors: { origin: '*' }, // à restreindre à l'URL du frontend en production
  });

  // Middleware d'authentification : chaque connexion socket doit fournir
  // le même token JWT que pour les requêtes API classiques
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentification requise'));
    }
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      socket.utilisateur = decode; // { id, role }
      next();
    } catch (error) {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    // Chaque utilisateur rejoint une "room" à son propre nom : ça permet
    // d'envoyer un événement précisément à lui, sans diffuser à tout le monde
    socket.join(socket.utilisateur.id);

    socket.on('disconnect', () => {
      // Rien de spécial à faire ici pour l'instant
    });
  });

  return io;
};

// Envoie un événement à un utilisateur précis (via sa room), depuis
// n'importe quel contrôleur, sans avoir besoin de manipuler socket.io directement
const emettreVersUtilisateur = (utilisateurId, evenement, donnees) => {
  if (!io) return; // sécurité si Socket.io n'est pas encore initialisé
  io.to(utilisateurId.toString()).emit(evenement, donnees);
};

module.exports = { initSocket, emettreVersUtilisateur };
