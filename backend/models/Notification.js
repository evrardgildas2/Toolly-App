const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    destinataire: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
    type: {
      type: String,
      enum: [
        'nouvelle_demande_mission',
        'mission_acceptee',
        'mission_refusee',
        'mission_demarree',
        'confirmation_attendue',
        'mission_terminee',
        'mission_annulee',
        'nouveau_message',
        'nouvelle_notation',
      ],
      required: true,
    },
    message: { type: String, required: true },
    // Référence libre vers l'objet concerné (mission, message...), utile pour
    // que le frontend redirige au bon endroit au clic sur la notification
    lien: { type: mongoose.Schema.Types.ObjectId, default: null },
    lu: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
