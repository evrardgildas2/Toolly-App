const mongoose = require('mongoose');

const notationSchema = new mongoose.Schema(
  {
    mission: { type: mongoose.Schema.Types.ObjectId, ref: 'Mission', required: true, unique: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'client', required: true },
    prestataire: { type: mongoose.Schema.Types.ObjectId, ref: 'prestataire', required: true },
    note: { type: Number, required: true, min: 1, max: 5 },
    // Jamais affiché publiquement — usage interne (modération, contexte admin)
    commentaire: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notation', notationSchema);
