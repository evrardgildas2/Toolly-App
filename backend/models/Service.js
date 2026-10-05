const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    prestataire: { type: mongoose.Schema.Types.ObjectId, ref: 'prestataire', required: true },
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie', required: true },
    titre: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    prixMin: { type: Number, required: true, min: 0 },
    photo: { type: String, default: null },
    actif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
