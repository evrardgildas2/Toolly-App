const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'client', required: true },
    prestataire: { type: mongoose.Schema.Types.ObjectId, ref: 'prestataire', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    statut: {
      type: String,
      enum: ['en_attente', 'acceptee', 'refusee', 'en_cours', 'terminee', 'annulee'],
      default: 'en_attente',
    },
    dateDebutPrevue: { type: Date, default: null },
    dateFinPrevue: { type: Date, default: null },
    dateDebutReelle: { type: Date, default: null },
    dateFinReelle: { type: Date, default: null },
    // Prix réellement convenu pour cette mission (peut différer du prixMin
    // affiché sur le service, si négocié au préalable dans la messagerie)
    prixConvenu: { type: Number, default: null },
    confirmationClient: { type: Boolean, default: false },
    confirmationPrestataire: { type: Boolean, default: false },
    montantCommission: { type: Number, default: null },
    commissionFacturee: { type: Boolean, default: false },
    historiqueStatuts: [
      {
        statut: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
    historiqueProlongations: [
      {
        ancienneDateFinPrevue: Date,
        nouvelleDateFinPrevue: Date,
        dateDemande: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// À chaque changement de statut, on garde une trace dans l'historique
missionSchema.pre('save', function tracerHistorique(next) {
  if (this.isModified('statut')) {
    this.historiqueStatuts.push({ statut: this.statut, date: new Date() });
  }
  next();
});

module.exports = mongoose.model('Mission', missionSchema);
