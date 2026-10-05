const Categorie = require('../models/Categorie');

// GET /api/categories
// Public : ne renvoie que les catégories approuvées
const listerCategories = async (req, res) => {
  try {
    const categories = await Categorie.find({ statut: 'approuvee' }).sort({ nom: 1 });
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération des catégories', erreur: error.message });
  }
};

// POST /api/categories
// Réservé aux administrateurs : création directe, approuvée immédiatement
const creerCategorie = async (req, res) => {
  try {
    const { nom, description, icone } = req.body;
    const categorie = await Categorie.create({ nom, description, icone, statut: 'approuvee' });
    return res.status(201).json(categorie);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la création de la catégorie', erreur: error.message });
  }
};

// POST /api/categories/proposer
// Réservé aux prestataires : la catégorie proposée reste en attente d'approbation
const proposerCategorie = async (req, res) => {
  try {
    const { nom, description } = req.body;

    const existeDeja = await Categorie.findOne({ nom });
    if (existeDeja) {
      return res.status(409).json({ message: 'Cette catégorie existe déjà', categorie: existeDeja });
    }

    const categorie = await Categorie.create({
      nom,
      description,
      statut: 'en_attente_approbation',
      proposeePar: req.utilisateur.id,
    });

    return res.status(201).json({
      message: 'Catégorie proposée avec succès, en attente de validation par un administrateur',
      categorie,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la proposition de la catégorie', erreur: error.message });
  }
};

// GET /api/categories/en-attente
// Réservé aux administrateurs
const listerCategoriesEnAttente = async (req, res) => {
  try {
    const categories = await Categorie.find({ statut: 'en_attente_approbation' })
      .populate('proposeePar', 'nom email')
      .sort({ createdAt: 1 });
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération', erreur: error.message });
  }
};

// PATCH /api/categories/:id/approuver
// Réservé aux administrateurs
const approuverCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findByIdAndUpdate(
      req.params.id,
      { statut: 'approuvee' },
      { new: true }
    );
    if (!categorie) {
      return res.status(404).json({ message: 'Catégorie introuvable' });
    }
    return res.status(200).json(categorie);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'approbation", erreur: error.message });
  }
};

// PATCH /api/categories/:id/rejeter
// Réservé aux administrateurs
const rejeterCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findByIdAndUpdate(
      req.params.id,
      { statut: 'rejetee' },
      { new: true }
    );
    if (!categorie) {
      return res.status(404).json({ message: 'Catégorie introuvable' });
    }
    return res.status(200).json(categorie);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors du rejet', erreur: error.message });
  }
};

module.exports = {
  listerCategories,
  creerCategorie,
  proposerCategorie,
  listerCategoriesEnAttente,
  approuverCategorie,
  rejeterCategorie,
};
