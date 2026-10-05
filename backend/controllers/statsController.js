const Prestataire = require('../models/Prestataire');
const Mission = require('../models/Mission');
const Notation = require('../models/Notation');

// GET /api/stats/publiques
const obtenirStatsPubliques = async (req, res) => {
  try {
    const [nombrePrestataires, nombreServicesRealises, resultatNotes] = await Promise.all([
      Prestataire.countDocuments({ statutVerification: 'verifie' }),
      Mission.countDocuments({ statut: 'terminee' }),
      Notation.aggregate([{ $group: { _id: null, moyenne: { $avg: '$note' } } }]),
    ]);

    // Convertit la note moyenne globale (sur 5) en pourcentage de satisfaction
    const moyenneGlobale = resultatNotes.length > 0 ? resultatNotes[0].moyenne : 5;
    const tauxSatisfaction = Math.round((moyenneGlobale / 5) * 100);

    return res.status(200).json({
      nombrePrestataires,
      nombreServicesRealises,
      tauxSatisfaction,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', erreur: error.message });
  }
};

module.exports = { obtenirStatsPubliques };
