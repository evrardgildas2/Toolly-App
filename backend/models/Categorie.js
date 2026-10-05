const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    icone: { type: String, default: null },
    statut: {
      type: String,
      enum: ['approuvee', 'en_attente_approbation', 'rejetee'],
      default: 'approuvee',
    },
    // Renseigné uniquement si la catégorie a été proposée par un prestataire
    // (plutôt que créée directement par un administrateur)
    proposeePar: { type: mongoose.Schema.Types.ObjectId, ref: 'prestataire', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Categorie', categorieSchema);
