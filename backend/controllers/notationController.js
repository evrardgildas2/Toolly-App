const Notation = require('../models/Notation');
const Mission = require('../models/Mission');
const Prestataire = require('../models/Prestataire');
const { creerEtEnvoyerNotification } = require('../utils/notifier');

// Recalcule et sauvegarde la note moyenne d'un prestataire à partir de
// toutes ses notations existantes
const recalculerNoteMoyenne = async (prestataireId) => {
  const resultat = await Notation.aggregate([
    { $match: { prestataire: prestataireId } },
    { $group: { _id: '$prestataire', moyenne: { $avg: '$note' }, total: { $sum: 1 } } },
  ]);

  const moyenne = resultat.length > 0 ? Math.round(resultat[0].moyenne * 10) / 10 : 0;
  const total = resultat.length > 0 ? resultat[0].total : 0;
  await Prestataire.findByIdAndUpdate(prestataireId, { noteMoyenne: moyenne, nombreAvis: total });
  return moyenne;
};

// POST /api/notations
// Réservé au client : ne peut noter qu'une mission terminée qui lui appartient, une seule fois
const creerNotation = async (req, res) => {
  try {
    const { missionId, note, commentaire } = req.body;

    const mission = await Mission.findById(missionId);
    if (!mission) {
      return res.status(404).json({ message: 'Mission introuvable' });
    }
    if (mission.client.toString() !== req.utilisateur.id) {
      return res.status(403).json({ message: 'Cette mission ne vous concerne pas' });
    }
    if (mission.statut !== 'terminee') {
      return res.status(400).json({ message: 'Vous ne pouvez noter que des missions terminées' });
    }

    const notationExistante = await Notation.findOne({ mission: missionId });
    if (notationExistante) {
      return res.status(409).json({ message: 'Cette mission a déjà été notée' });
    }

    const notation = await Notation.create({
      mission: missionId,
      client: req.utilisateur.id,
      prestataire: mission.prestataire,
      note,
      commentaire: commentaire || '',
    });

    const nouvelleMoyenne = await recalculerNoteMoyenne(mission.prestataire);

    await creerEtEnvoyerNotification({
      destinataire: mission.prestataire,
      type: 'nouvelle_notation',
      message: 'Vous avez reçu une nouvelle notation',
      lien: notation._id,
    });

    return res.status(201).json({ notation, nouvelleMoyenne });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Cette mission a déjà été notée' });
    }
    return res.status(500).json({ message: 'Erreur lors de la notation', erreur: error.message });
  }
};

// GET /api/notations/mes-notations-recues
// Réservé au prestataire : consultation interne de ses notes + commentaires (jamais exposé publiquement)
const listerMesNotationsRecues = async (req, res) => {
  try {
    const notations = await Notation.find({ prestataire: req.utilisateur.id })
      .populate('client', 'nom')
      .populate('mission', 'service')
      .sort({ createdAt: -1 });

    return res.status(200).json(notations);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération', erreur: error.message });
  }
};

module.exports = { creerNotation, listerMesNotationsRecues };
