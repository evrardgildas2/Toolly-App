const Message = require('../models/Message');
const { emettreVersUtilisateur } = require('../sockets/socketServer');
const { creerEtEnvoyerNotification } = require('../utils/notifier');
const mongoose = require('mongoose'); const Utilisateur = require('../models/Utilisateur');
// POST /api/messages
// body : { destinataireId, contenu, missionId? }
const envoyerMessage = async (req, res) => {
  try {
    const { destinataireId, contenu, missionId } = req.body;

    if (!contenu || !contenu.trim()) {
      return res.status(400).json({ message: 'Le message ne peut pas être vide' });
    }

    const message = await Message.create({
      expediteur: req.utilisateur.id,
      destinataire: destinataireId,
      contenu,
      mission: missionId || null,
    });

    // Diffusion en temps réel au destinataire s'il est connecté
    emettreVersUtilisateur(destinataireId, 'nouveau_message', message);

    // Notification persistante (visible même si le destinataire n'est pas connecté au moment de l'envoi)
    await creerEtEnvoyerNotification({
      destinataire: destinataireId,
      type: 'nouveau_message',
      message: 'Vous avez reçu un nouveau message',
      lien: message._id,
    });

    return res.status(201).json(message);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'envoi du message", erreur: error.message });
  }
};

// GET /api/messages/:autreUtilisateurId
// Historique de la conversation entre l'utilisateur connecté et un autre utilisateur
const obtenirConversation = async (req, res) => {
  try {
    const { autreUtilisateurId } = req.params;
    const moi = req.utilisateur.id;

    const messages = await Message.find({
      $or: [
        { expediteur: moi, destinataire: autreUtilisateurId },
        { expediteur: autreUtilisateurId, destinataire: moi },
      ],
    }).sort({ createdAt: 1 });

    // Marque comme lus tous les messages reçus dans cette conversation
    await Message.updateMany(
      { expediteur: autreUtilisateurId, destinataire: moi, lu: false },
      { lu: true }
    );

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération de la conversation', erreur: error.message });
  }
};

// GET /api/messages // Liste toutes les conversations de l'utilisateur connecté, avec le dernier // message et le nombre de non-lus pour chacune 
const listerConversations = async (req, res) => { try { const moi = new mongoose.Types.ObjectId(req.utilisateur.id); 
const conversations = await Message.aggregate([ { 
   $match: { $or: [{ expediteur: moi }, { destinataire: moi }] } }, { $sort: { createdAt: -1 } }, { $group: { _id: { $cond: [{ $eq: ['$expediteur', moi] }, '$destinataire', '$expediteur'] }, dernierMessage: { $first: '$$ROOT' }, nonLus: { $sum: { $cond: [{ $and: [{ $eq: ['$destinataire', moi] }, { $eq: ['$lu', false] }] }, 1, 0] }, }, }, }, { $sort: { 'dernierMessage.createdAt': -1 } }, ]); 
   const resultats = await Promise.all( conversations.map(async (conv) => { const autreUtilisateur = await Utilisateur.findById(conv._id).select('nom photo role'); 
    return { utilisateur: autreUtilisateur, dernierMessage: conv.dernierMessage, nonLus: conv.nonLus }; }) ); 
    return res.status(200).json(resultats.filter((r) => r.utilisateur)); } 
    catch (error) { 
      return res.status(500).json({ message: 'Erreur lors de la récupération des conversations', erreur: error.message }); } };

module.exports = { envoyerMessage, obtenirConversation, listerConversations };
