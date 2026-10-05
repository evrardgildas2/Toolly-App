const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schéma de base partagé par les 3 rôles (client, prestataire, administrateur).
// On utilise un discriminateur Mongoose pour éviter de dupliquer les champs
// communs (nom, email, mot de passe...) dans chaque rôle.
const options = { discriminatorKey: 'role', timestamps: true };

const utilisateurSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    motDePasse: { type: String, required: true, select: false },
    telephone: { type: String, required: true, trim: true },
    photo: { type: String, default: null },
    dateNaissance: { type: Date, default: null },
    genre: { type: String, enum: ['masculin', 'feminin', 'autre', null], default: null },
    statutCompte: {
      type: String,
      enum: ['actif', 'suspendu_temporaire', 'suspendu_definitif'],
      default: 'actif',
    },
  },
  options
);

// Hash automatique du mot de passe avant sauvegarde
utilisateurSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('motDePasse')) return next();
  this.motDePasse = await bcrypt.hash(this.motDePasse, 10);
  next();
});

// Méthode pour comparer un mot de passe en clair avec le hash stocké
utilisateurSchema.methods.comparerMotDePasse = function comparerMotDePasse(motDePasseSaisi) {
  return bcrypt.compare(motDePasseSaisi, this.motDePasse);
};

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;
