 const Utilisateur = require('../models/Utilisateur'); 
 require('../models/Administrateur'); 
 // Crée un administrateur au démarrage si les variables ADMIN_* sont définies // et qu'aucun compte n'existe déjà avec cet email. 
 const creerAdminInitial = async () => { const { ADMIN_NOM, ADMIN_EMAIL, ADMIN_MOT_DE_PASSE, ADMIN_TELEPHONE } = process.env; 
 if (!ADMIN_NOM || !ADMIN_EMAIL || !ADMIN_MOT_DE_PASSE || !ADMIN_TELEPHONE) return; 
 try { const existeDeja = await Utilisateur.findOne({ email: ADMIN_EMAIL.toLowerCase() }); 
 if (existeDeja) return; 
 const Administrateur = Utilisateur.discriminators['administrateur']; 
 await Administrateur.create({ nom: ADMIN_NOM, email: ADMIN_EMAIL, motDePasse: ADMIN_MOT_DE_PASSE, telephone: ADMIN_TELEPHONE, }); 
 console.log(`Administrateur initial créé : ${ADMIN_EMAIL}`); 
} catch (error) { 
    console.error("Erreur lors de la création de l'administrateur initial :", error.message); } }; 
    module.exports = { creerAdminInitial };