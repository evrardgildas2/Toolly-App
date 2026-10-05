const mongoose = require('mongoose');
const Utilisateur = require('./Utilisateur');

const clientSchema = new mongoose.Schema({
  adresse: { type: String, default: '' },
  nombreSignalementsValides: { type: Number, default: 0 },
});

const Client = Utilisateur.discriminator('client', clientSchema);

module.exports = Client;
