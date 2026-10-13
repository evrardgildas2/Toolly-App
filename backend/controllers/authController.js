const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');
require('../models/Prestataire');
require('../models/Client');
require('../models/Administrateur');

const genererToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/inscription
// body attendu : { role: 'client' | 'prestataire' | 'administrateur', nom, email, motDePasse, telephone, ...champsSpecifiques }
const inscription = async (req, res) => {
  try {
    const { role, nom, email, motDePasse, telephone, ...champsSpecifiques } = req.body;

    if (!['client', 'prestataire', 'administrateur'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    const emailExiste = await Utilisateur.findOne({ email });
    if (emailExiste) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }

    // On récupère le bon modèle discriminé selon le rôle
    const ModeleRole = Utilisateur.discriminators[role];
    const nouvelUtilisateur = await ModeleRole.create({
      nom,
      email,
      motDePasse,
      telephone,
      ...champsSpecifiques,
    });

    const token = genererToken(nouvelUtilisateur._id, role);

    return res.status(201).json({
      utilisateur: {
        id: nouvelUtilisateur._id,
        nom: nouvelUtilisateur.nom,
        email: nouvelUtilisateur.email,
        role,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'inscription", erreur: error.message });
  }
};

// POST /api/auth/connexion
// body attendu : { email, motDePasse }
const connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const utilisateur = await Utilisateur.findOne({ email }).select('+motDePasse');
    if (!utilisateur) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    if (utilisateur.statutCompte !== 'actif') {
      return res.status(403).json({ message: 'Ce compte est suspendu' });
    }

    const motDePasseValide = await utilisateur.comparerMotDePasse(motDePasse);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const token = genererToken(utilisateur._id, utilisateur.role);

    return res.status(200).json({
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        role: utilisateur.role,
        photo: utilisateur.photo,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la connexion', erreur: error.message });
  }
};

// GET /api/auth/moi
// Renvoie le profil complet de l'utilisateur connecté (selon son rôle réel)
const obtenirMoi = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.utilisateur.id).populate('categories', 'nom');
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    return res.status(200).json(utilisateur);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération du profil', erreur: error.message });
  }
};

// PATCH /api/auth/moi
// Modifie les champs autorisés du profil de l'utilisateur connecté
const modifierMoi = async (req, res) => {
  try {
    const champsCommuns = ['nom', 'telephone', 'photo', 'dateNaissance', 'genre'];
    const champsPrestataire = [
      'metier',
      'description',
      'competences',
      'diplomes',
      'experiences',
      'region',
      'ville',
      'quartier',
    ];

    const champsAutorises =
      req.utilisateur.role === 'prestataire' ? [...champsCommuns, ...champsPrestataire] : champsCommuns;

    const miseAJour = {};
    champsAutorises.forEach((champ) => {
      if (req.body[champ] !== undefined) {
        miseAJour[champ] = req.body[champ];
      }
    });

    const utilisateur = await Utilisateur.findByIdAndUpdate(req.utilisateur.id, miseAJour, { new: true });
    return res.status(200).json(utilisateur);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la modification du profil', erreur: error.message });
  }
};

// PATCH /api/auth/mot-de-passe // body : { ancienMotDePasse, nouveauMotDePasse } 
const changerMotDePasse = async (req, res) => { 
  try { 
    const { ancienMotDePasse, nouveauMotDePasse } = req.body; 
    if (!ancienMotDePasse || !nouveauMotDePasse) { 
       return res.status(400).json({ message: 'Ancien et nouveau mot de passe requis' }); } 
       if (nouveauMotDePasse.length < 8) { 
        return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' }); } 
        if (ancienMotDePasse === nouveauMotDePasse) { 
          return res.status(400).json({ message: 'Le nouveau mot de passe doit être différent du précédent' }); } 
          const utilisateur = await Utilisateur.findById(req.utilisateur.id).select('+motDePasse'); 
          if (!utilisateur) { return res.status(404).json({ message: 'Utilisateur introuvable' }); } 
          const ancienValide = await utilisateur.comparerMotDePasse(ancienMotDePasse); 
          if (!ancienValide) { return res.status(400).json({ message: 'Ancien mot de passe incorrect' }); } 
          // Le hook pre('save') du modèle hache automatiquement le nouveau mot de passe 
          utilisateur.motDePasse = nouveauMotDePasse; 
          await utilisateur.save(); 
          return res.status(200).json({ message: 'Mot de passe modifié avec succès' }); } 
          catch (error) { 
            return res.status(500).json({ message: 'Erreur lors du changement de mot de passe', erreur: error.message }); } }; 
             
            module.exports = { inscription, connexion, obtenirMoi, modifierMoi, changerMotDePasse }; 

