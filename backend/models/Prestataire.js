const mongoose = require('mongoose');
const Utilisateur = require('./Utilisateur');

const diplomeSchema = new mongoose.Schema(
  {
    intitule: { type: String, required: true },
    etablissement: { type: String, default: '' },
    statut: { type: String, default: '' }, // ex: "En cours (L2)", "Obtenu"
    periode: { type: String, default: '' }, // ex: "2024 - 2027"
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    poste: { type: String, required: true },
    typeContrat: { type: String, default: '' }, // ex: "Freelance", "CDI", "Stage"
    periode: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const prestataireSchema = new mongoose.Schema({
  metier: { type: String, default: '' }, // ex: "Développeur Web | Designer UI/UX"
  description: { type: String, default: '' }, // sert de "à propos de moi"
  competences: [{ type: String, trim: true }],
  diplomes: [diplomeSchema],
  experiences: [experienceSchema],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Categorie' }],
  classificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classification', default: null },
  noteMoyenne: { type: Number, default: 0, min: 0, max: 5 },
  nombreAvis: { type: Number, default: 0 },
  nombreMissionsTerminees: { type: Number, default: 0 },
  nombreMissionsAnnulees: { type: Number, default: 0 },
  statutVerification: {
    type: String,
    enum: ['non_verifie', 'en_attente', 'verifie'],
    default: 'non_verifie',
  },
  photosProfil: [{ type: String }],

  // Photos soumises pour prouver la correspondance avec la catégorie choisie
  // (minimum 5, exigées lors de la demande de vérification)
  photosVerification: [{ type: String }],
  dateDemandeVerification: { type: Date, default: null },
  motifRejetVerification: { type: String, default: null },

  // Localisation structurée (utilisée pour la recherche/le filtrage dès la Phase 1)
  region: { type: String, default: null },
  ville: { type: String, default: null },
  quartier: { type: String, default: null },

  // Coordonnées GPS précises (facultatives pour l'instant, prêtes pour une
  // recherche par distance ou une carte plus tard). Format GeoJSON requis
  // par MongoDB pour les index géospatiaux.
  localisationGPS: {
    type: {
      type: String,
      enum: ['Point'],
      default: undefined, // ne jamais auto-remplir : sans coordonnées, ce serait un GeoJSON invalide
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: undefined,
    },
  },
});

// Index géospatial : permettra plus tard des requêtes comme
// "prestataires les plus proches de tel point" (opérateur $near)
prestataireSchema.index({ localisationGPS: '2dsphere' });

const Prestataire = Utilisateur.discriminator('prestataire', prestataireSchema);

module.exports = Prestataire;
