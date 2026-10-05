const Prestataire = require('../models/Prestataire');

const NOMBRE_MIN_PHOTOS_VERIFICATION = 5;

// GET /api/prestataires
// Public : uniquement les prestataires vérifiés, pour l'affichage sur le site
const listerPrestatairesPublics = async (req, res) => {
  try {
    const filtre = { statutVerification: 'verifie' };
    if (req.query.categorie) {
      filtre.categories = req.query.categorie;
    }

    const prestataires = await Prestataire.find(filtre)
      .select('nom photo ville region noteMoyenne nombreAvis categories description')
      .populate('categories', 'nom')
      .sort({ noteMoyenne: -1 })
      .limit(Number(req.query.limite) || 20);

    return res.status(200).json(prestataires);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération des prestataires', erreur: error.message });
  }
};

// GET /api/prestataires/:id
// Public : profil détaillé d'un prestataire
const obtenirPrestatairePublic = async (req, res) => {
  try {
    const prestataire = await Prestataire.findOne({ _id: req.params.id, statutVerification: 'verifie' })
      .select('nom photo ville region noteMoyenne nombreAvis categories description photosProfil')
      .populate('categories', 'nom');

    if (!prestataire) {
      return res.status(404).json({ message: 'Prestataire introuvable' });
    }
    return res.status(200).json(prestataire);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération', erreur: error.message });
  }
};

// POST /api/prestataires/verification
// Réservé au prestataire lui-même : soumet ses photos pour validation
const soumettreVerification = async (req, res) => {
  try {
    const { photosVerification } = req.body;

    if (!Array.isArray(photosVerification) || photosVerification.length < NOMBRE_MIN_PHOTOS_VERIFICATION) {
      return res.status(400).json({
        message: `Il faut fournir au moins ${NOMBRE_MIN_PHOTOS_VERIFICATION} photos en concordance avec votre catégorie`,
      });
    }

    const prestataire = await Prestataire.findByIdAndUpdate(
      req.utilisateur.id,
      {
        photosVerification,
        statutVerification: 'en_attente',
        dateDemandeVerification: new Date(),
        motifRejetVerification: null,
      },
      { new: true }
    );

    return res.status(200).json({
      message: 'Demande de vérification envoyée, en attente de validation par un administrateur',
      prestataire,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la soumission', erreur: error.message });
  }
};

// GET /api/prestataires/verification/en-attente
// Réservé aux administrateurs
const listerVerificationsEnAttente = async (req, res) => {
  try {
    const prestataires = await Prestataire.find({ statutVerification: 'en_attente' })
      .select('nom email categories photosVerification dateDemandeVerification')
      .populate('categories', 'nom')
      .sort({ dateDemandeVerification: 1 });

    return res.status(200).json(prestataires);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération', erreur: error.message });
  }
};

// PATCH /api/prestataires/:id/verification/approuver
// Réservé aux administrateurs
const approuverVerification = async (req, res) => {
  try {
    const prestataire = await Prestataire.findByIdAndUpdate(
      req.params.id,
      { statutVerification: 'verifie', motifRejetVerification: null },
      { new: true }
    );
    if (!prestataire) {
      return res.status(404).json({ message: 'Prestataire introuvable' });
    }
    return res.status(200).json(prestataire);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'approbation", erreur: error.message });
  }
};

// PATCH /api/prestataires/:id/verification/rejeter
// Réservé aux administrateurs
const rejeterVerification = async (req, res) => {
  try {
    const { motif } = req.body;
    const prestataire = await Prestataire.findByIdAndUpdate(
      req.params.id,
      { statutVerification: 'non_verifie', motifRejetVerification: motif || 'Non conforme' },
      { new: true }
    );
    if (!prestataire) {
      return res.status(404).json({ message: 'Prestataire introuvable' });
    }
    return res.status(200).json(prestataire);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors du rejet', erreur: error.message });
  }
};

module.exports = {
  listerPrestatairesPublics,
  obtenirPrestatairePublic,
  soumettreVerification,
  listerVerificationsEnAttente,
  approuverVerification,
  rejeterVerification,
};
