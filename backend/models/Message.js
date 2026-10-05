const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    expediteur: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
    destinataire: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
    contenu: { type: String, required: true, trim: true },
    lu: { type: Boolean, default: false },
    // Rattachement facultatif à une mission précise, utile plus tard pour la
    // modération/détection de contournement discutée pour la Phase 3
    mission: { type: mongoose.Schema.Types.ObjectId, ref: 'Mission', default: null },
  },
  { timestamps: true }
);

// Index pour retrouver rapidement une conversation entre deux utilisateurs
messageSchema.index({ expediteur: 1, destinataire: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
