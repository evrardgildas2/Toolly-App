const Realisation = require('../models/Realisation');
const Mission = require('../models/Mission');

// GET /api/realisations
// Public : fil de toutes les réalisations visibles, filtrable par catégorie (?categorie=id)
const listerRealisationsPubliques = async (req, res) => {
  try {
    const filtre = { visible: true };
    if (req.query.categorie) {
      filtre.categorie = req.query.categorie;
    }

    const realisations = await Realisation.find(filtre)
      .populate('prestataire', 'nom photo ville region noteMoyenne nombreAvis')
      .populate('categorie', 'nom')
      .sort({ date: -1 });

    return res.status(200).json(realisations);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération', erreur: error.message });
  }
};

// GET /api/realisations/:id
const obtenirRealisation = async (req, res) => {
  try {
    const realisation = await Realisation.findById(req.params.id)
      .populate('prestataire', 'nom photo ville region noteMoyenne description')
      .populate('categorie', 'nom');

    if (!realisation || !realisation.visible) {
      return res.status(404).json({ message: 'Réalisation introuvable' });
    }
    return res.status(200).json(realisation);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération', erreur: error.message });
  }
};

// POST /api/realisations
// Réservé au prestataire : doit être rattachée à l'une de ses missions réelles (en cours ou terminée)
const creerRealisation = async (req, res) => {
  try {
    const { missionId, titre, ville, photos, etapes, visible } = req.body;

    const mission = await Mission.findById(missionId).populate('service');
    if (!mission) {
      return res.status(404).json({ message: 'Mission introuvable' });
    }
    if (mission.prestataire.toString() !== req.utilisateur.id) {
      return res.status(403).json({ message: "Cette mission ne vous concerne pas" });
    }
    if (!['en_cours', 'terminee'].includes(mission.statut)) {
      return res.status(400).json({
        message: 'Une réalisation ne peut être documentée que pour une mission en cours ou terminée',
      });
    }

    const realisation = await Realisation.create({
      prestataire: req.utilisateur.id,
      mission: missionId,
      categorie: mission.service.categorie,
      titre,
      ville,
      photos: photos || [],
      etapes: etapes || [],
      visible: visible !== undefined ? visible : true,
    });

    return res.status(201).json(realisation);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la création', erreur: error.message });
  }
};

// GET /api/realisations/mes-realisations
// Réservé au prestataire : ses réalisations, visibles ou non
const listerMesRealisations = async (req, res) => {
  try {
    const realisations = await Realisation.find({ prestataire: req.utilisateur.id })
      .populate('categorie', 'nom')
      .sort({ date: -1 });
    return res.status(200).json(realisations);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération', erreur: error.message });
  }
};

// PUT /api/realisations/:id
// Réservé au prestataire propriétaire
const modifierRealisation = async (req, res) => {
  try {
    const realisation = await Realisation.findById(req.params.id);
    if (!realisation) {
      return res.status(404).json({ message: 'Réalisation introuvable' });
    }
    if (realisation.prestataire.toString() !== req.utilisateur.id) {
      return res.status(403).json({ message: "Vous n'êtes pas le propriétaire de cette réalisation" });
    }

    const champsAutorises = ['titre', 'ville', 'photos', 'etapes', 'visible'];
    champsAutorises.forEach((champ) => {
      if (req.body[champ] !== undefined) {
        realisation[champ] = req.body[champ];
      }
    });

    await realisation.save();
    return res.status(200).json(realisation);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la modification', erreur: error.message });
  }
};

// DELETE /api/realisations/:id
// Réservé au prestataire propriétaire
const supprimerRealisation = async (req, res) => {
  try {
    const realisation = await Realisation.findById(req.params.id);
    if (!realisation) {
      return res.status(404).json({ message: 'Réalisation introuvable' });
    }
    if (realisation.prestataire.toString() !== req.utilisateur.id) {
      return res.status(403).json({ message: "Vous n'êtes pas le propriétaire de cette réalisation" });
    }

    await realisation.deleteOne();
    return res.status(200).json({ message: 'Réalisation supprimée' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la suppression', erreur: error.message });
  }
};

module.exports = {
  listerRealisationsPubliques,
  obtenirRealisation,
  creerRealisation,
  listerMesRealisations,
  modifierRealisation,
  supprimerRealisation,
};
