const Notification = require('../models/Notification');
const { emettreVersUtilisateur } = require('../sockets/socketServer');

// Crée une notification en base ET la pousse en temps réel via Socket.io
// si le destinataire est actuellement connecté.
const creerEtEnvoyerNotification = async ({ destinataire, type, message, lien = null }) => {
  const notification = await Notification.create({ destinataire, type, message, lien });
  emettreVersUtilisateur(destinataire, 'notification', notification);
  return notification;
};

module.exports = { creerEtEnvoyerNotification };
