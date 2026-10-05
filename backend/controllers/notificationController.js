const Notification = require('../models/Notification');

// GET /api/notifications
// Les notifications de l'utilisateur connecté, les plus récentes en premier
const listerMesNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ destinataire: req.utilisateur.id }).sort({
      createdAt: -1,
    });
    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération des notifications', erreur: error.message });
  }
};

// PATCH /api/notifications/:id/lue
const marquerCommeLue = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, destinataire: req.utilisateur.id },
      { lu: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification introuvable' });
    }
    return res.status(200).json(notification);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour', erreur: error.message });
  }
};

module.exports = { listerMesNotifications, marquerCommeLue };
