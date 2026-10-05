// Usage : node scripts/creerAdmin.js "Nom Complet" email@exemple.com motDePasse telephone
// Exécuté une seule fois pour créer le tout premier administrateur, puisque
// l'inscription publique n'accepte jamais ce rôle (voir authController.js).
require('dotenv').config();
const mongoose = require('mongoose');
const Utilisateur = require('../models/Utilisateur');
require('../models/Administrateur');

const [, , nom, email, motDePasse, telephone] = process.argv;

if (!nom || !email || !motDePasse || !telephone) {
  console.error('Usage : node scripts/creerAdmin.js "Nom Complet" email@exemple.com motDePasse telephone');
  process.exit(1);
}

const creerAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existeDeja = await Utilisateur.findOne({ email });
  if (existeDeja) {
    console.error('Un utilisateur avec cet email existe déjà.');
    process.exit(1);
  }

  const Administrateur = Utilisateur.discriminators['administrateur'];
  const admin = await Administrateur.create({ nom, email, motDePasse, telephone });

  console.log(`Administrateur créé avec succès : ${admin.email}`);
  process.exit(0);
};

creerAdmin().catch((error) => {
  console.error('Erreur lors de la création :', error.message);
  process.exit(1);
});
