const Service = require('../models/Service');
const Categorie = require('../models/Categorie');

// GET /api/services
// Public : liste des services actifs, filtrable par catégorie (?categorie=id)
const listerServices = async (req, res) => {
  try {
    const filtre = { actif: true };
    if (req.query.categorie) {
      filtre.categorie = req.query.categorie;
    }

    const services = await Service.find(filtre)
      .populate('categorie', 'nom')
      .populate('prestataire', 'nom photo noteMoyenne nombreAvis nombreMissionsTerminees ville region statutVerification')
      .sort({ createdAt: -1 });

    return res.status(200).json(services);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération des services', erreur: error.message });
  }
};

// GET /api/services/:id
const obtenirService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('categorie', 'nom')
      .populate('prestataire', 'nom photo noteMoyenne nombreAvis nombreMissionsTerminees ville region statutVerification description');

    if (!service) {
      return res.status(404).json({ message: 'Service introuvable' });
    }
    return res.status(200).json(service);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération du service', erreur: error.message });
  }
};

// POST /api/services
// Réservé aux prestataires
const creerService = async (req, res) => {
  try {
    const { categorie, titre, description, prixMin, photo } = req.body;

    const categorieDoc = await Categorie.findById(categorie);
    if (!categorieDoc || categorieDoc.statut !== 'approuvee') {
      return res.status(400).json({ message: "Cette catégorie n'est pas valide ou pas encore approuvée" });
    }

    const service = await Service.create({
      prestataire: req.utilisateur.id,
      categorie,
      titre,
      description,
      prixMin,
      photo,
    });

    return res.status(201).json(service);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la création du service', erreur: error.message });
  }
};

// GET /api/services/mes-services
// Réservé aux prestataires : leurs propres services (actifs ou non)
const listerMesServices = async (req, res) => {
  try {
    const services = await Service.find({ prestataire: req.utilisateur.id })
      .populate('categorie', 'nom')
      .sort({ createdAt: -1 });
    return res.status(200).json(services);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération', erreur: error.message });
  }
};

// PUT /api/services/:id
// Réservé au prestataire propriétaire du service
const modifierService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service introuvable' });
    }
    if (service.prestataire.toString() !== req.utilisateur.id) {
      return res.status(403).json({ message: "Vous n'êtes pas le propriétaire de ce service" });
    }

    const champsAutorises = ['titre', 'description', 'prixMin', 'photo', 'categorie', 'actif'];
    champsAutorises.forEach((champ) => {
      if (req.body[champ] !== undefined) {
        service[champ] = req.body[champ];
      }
    });

    await service.save();
    return res.status(200).json(service);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la modification', erreur: error.message });
  }
};

// DELETE /api/services/:id
// Réservé au prestataire propriétaire du service
const supprimerService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service introuvable' });
    }
    if (service.prestataire.toString() !== req.utilisateur.id) {
      return res.status(403).json({ message: "Vous n'êtes pas le propriétaire de ce service" });
    }

    await service.deleteOne();
    return res.status(200).json({ message: 'Service supprimé' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la suppression', erreur: error.message });
  }
};

module.exports = {
  listerServices,
  obtenirService,
  creerService,
  listerMesServices,
  modifierService,
  supprimerService,
};
