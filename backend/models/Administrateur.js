const mongoose = require('mongoose');
const Utilisateur = require('./Utilisateur');

// Pas de champs spécifiques pour l'instant : un administrateur est un
// utilisateur avec role = 'administrateur'. On garde un discriminateur
// séparé pour pouvoir ajouter des champs propres (permissions, etc.) plus tard.
const administrateurSchema = new mongoose.Schema({});

const Administrateur = Utilisateur.discriminator('administrateur', administrateurSchema);

module.exports = Administrateur;
