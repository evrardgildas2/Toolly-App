const mongoose = require('mongoose');

const etapeSchema = new mongoose.Schema(
  {
    numero: { type: Number, required: true },
    titre: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    photo: { type: String, default: null },
  },
  { _id: false }
);

const realisationSchema = new mongoose.Schema(
  {
    prestataire: { type: mongoose.Schema.Types.ObjectId, ref: 'prestataire', required: true },
    mission: { type: mongoose.Schema.Types.ObjectId, ref: 'Mission', required: true },
    // Copié depuis mission.service.categorie à la création, pour permettre
    // de filtrer le fil public par catégorie sans jointure supplémentaire
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie', required: true },
    titre: { type: String, required: true, trim: true },
    ville: { type: String, default: null },
    date: { type: Date, default: Date.now },
    photos: [{ type: String }],
    etapes: [etapeSchema],
    // Le prestataire choisit de publier ou non cette documentation
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Realisation', realisationSchema);
